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
    private final LdapTemplate ldapTemplate;

    @Value("${spring.ldap.base:dc=cloudforge,dc=io}")
    private String ldapBase;

    public LoginResponse login(LoginRequest request) {
        log.debug("Login attempt for user: {}", request.getUsername());
        
        // First try database authentication
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user != null) {
            log.debug("User found in database: {}", request.getUsername());
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

        // If user not in database, attempt LDAP authentication
        log.debug("User not in database, attempting LDAP authentication: {}", request.getUsername());
        return authenticateWithLdap(request);
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

    private LoginResponse authenticateWithLdap(LoginRequest request) {
        try {
            // Build LDAP DN for the user
            String userDn = String.format("uid=%s,ou=users,%s", request.getUsername(), ldapBase);
            log.debug("Attempting LDAP authentication with DN: {}", userDn);
            
            // Attempt to bind with the user's credentials
            boolean authenticated = ldapTemplate.authenticate(
                    "ou=users",
                    "(uid=" + request.getUsername() + ")",
                    request.getPassword()
            );
            
            if (!authenticated) {
                log.warn("LDAP authentication failed for user: {}", request.getUsername());
                throw new RuntimeException("Invalid username or password");
            }
            
            log.info("LDAP authentication successful for user: {}", request.getUsername());
            
            // Fetch user details from LDAP using search
            org.springframework.ldap.core.DirContextOperations ldapUser = ldapTemplate.searchForContext(
                    org.springframework.ldap.query.LdapQueryBuilder.query()
                            .base("ou=users")
                            .where("uid").is(request.getUsername())
            );
            
            String email = ldapUser.getStringAttribute("mail");
            String fullName = ldapUser.getStringAttribute("cn");
            String givenName = ldapUser.getStringAttribute("givenName");
            String surname = ldapUser.getStringAttribute("sn");
            
            // Create or update user in database for JWT token generation
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .username(request.getUsername())
                                .email(email != null ? email : request.getUsername() + "@cloudforge.io")
                                .firstName(givenName != null ? givenName : request.getUsername())
                                .lastName(surname != null ? surname : "")
                                .passwordHash(passwordEncoder.encode(request.getPassword())) // Store for future DB auth
                                .role(User.Role.USER)
                                .enabled(true)
                                .build();
                        log.info("Creating new user from LDAP: {}", request.getUsername());
                        return userRepository.save(newUser);
                    });
            
            // Generate JWT token using authentication manager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.generateToken(authentication);
            
            log.info("User logged in via LDAP auth: {}", request.getUsername());
            return LoginResponse.of(token, UserDTO.fromEntity(user));
            
        } catch (Exception e) {
            log.error("LDAP authentication error for user {}: {}", request.getUsername(), e.getMessage(), e);
            throw new RuntimeException("Invalid username or password");
        }
    }
}
