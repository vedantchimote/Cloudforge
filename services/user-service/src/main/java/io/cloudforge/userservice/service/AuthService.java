package io.cloudforge.userservice.service;

import io.cloudforge.userservice.dto.LoginRequest;
import io.cloudforge.userservice.dto.LoginResponse;
import io.cloudforge.userservice.dto.RegisterRequest;
import io.cloudforge.userservice.dto.UserDTO;
import io.cloudforge.userservice.entity.User;
import io.cloudforge.userservice.repository.UserRepository;
import io.cloudforge.userservice.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${spring.ldap.base:dc=cloudforge,dc=io}")
    private String ldapBase;

    public LoginResponse login(LoginRequest request) {
        // First try database authentication
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user != null) {
            // Authenticate with database password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.generateToken(authentication);

            log.info("User logged in via database auth: {}", request.getUsername());
            return LoginResponse.of(token, UserDTO.fromEntity(user));
        }

        // If user not in database, attempt LDAP authentication would go here
        // For MVP, we'll focus on database auth
        throw new RuntimeException("Invalid username or password");
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // Create new user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.USER)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new user: {}", savedUser.getUsername());

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return LoginResponse.of(token, UserDTO.fromEntity(savedUser));
    }
}
