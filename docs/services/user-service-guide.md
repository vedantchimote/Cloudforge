# User Service Guide

Complete development guide for the User microservice.

---

## 📋 Service Overview

| Property | Value |
|----------|-------|
| **Port** | 8081 |
| **Database** | PostgreSQL |
| **Auth** | LDAP + JWT |
| **Messaging** | N/A (producer only) |

### Responsibilities
- User registration and management
- LDAP authentication
- JWT token generation
- Role-based access control (RBAC)
- User profile management

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Service                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │AuthController│  │UserController│  │AdminController│       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌─────────────────────────────────────────────────┐        │
│  │              Service Layer                       │        │
│  │  AuthService │ UserService │ RoleService         │        │
│  └─────────────────────────────────────────────────┘        │
│         │                │                                   │
│         ▼                ▼                                   │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐           │
│  │   LDAP    │    │PostgreSQL │    │   Redis   │           │
│  │ (Auth)    │    │ (Users)   │    │ (Cache)   │           │
│  └───────────┘    └───────────┘    └───────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
services/user-service/
├── src/main/java/com/cloudforge/user/
│   ├── UserServiceApplication.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   └── AdminController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── UserService.java
│   │   ├── JwtService.java
│   │   └── LdapUserService.java
│   ├── repository/
│   │   └── UserRepository.java
│   ├── model/
│   │   ├── User.java
│   │   └── Role.java
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   ├── RegisterRequest.java
│   │   ├── UserRequest.java
│   │   └── UserResponse.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── LdapConfig.java
│   │   └── OpenApiConfig.java
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       ├── UserNotFoundException.java
│       └── InvalidCredentialsException.java
└── src/main/resources/
    ├── application.yml
    └── db/migration/
        └── V1__create_users_table.sql
```

---

## 🔧 Configuration

```yaml
# application.yml
spring:
  application:
    name: user-service

  datasource:
    url: jdbc:postgresql://localhost:5432/cloudforge_users
    username: ${DB_USERNAME:cloudforge}
    password: ${DB_PASSWORD:cloudforge123}

ldap:
  url: ldap://localhost:389
  base: dc=cloudforge,dc=io
  user-dn-pattern: uid={0},ou=users
  group-search-base: ou=groups

jwt:
  secret: ${JWT_SECRET:your-256-bit-secret-key-here}
  expiration: 3600  # 1 hour

server:
  port: 8081
```

---

## 📝 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Authenticate user | ❌ |
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/refresh` | Refresh JWT token | ✅ |
| GET | `/api/users/me` | Get current user | ✅ |
| PUT | `/api/users/me` | Update current user | ✅ |
| GET | `/api/users/{id}` | Get user by ID | ✅ ADMIN |
| GET | `/api/users` | List all users | ✅ ADMIN |
| DELETE | `/api/users/{id}` | Delete user | ✅ ADMIN |

---

## 💻 Key Code

### AuthController
```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(authService.register(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(authService.refreshToken(authHeader));
    }
}
```

### AuthService
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final LdapUserService ldapUserService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse authenticate(LoginRequest request) {
        // Authenticate via LDAP
        LdapUser ldapUser = ldapUserService.authenticate(
            request.getUsername(), request.getPassword());
        
        // Get or create local user
        User user = userRepository.findByUsername(request.getUsername())
            .orElseGet(() -> createUserFromLdap(ldapUser));
        
        // Generate JWT
        String token = jwtService.generateToken(user);
        
        return LoginResponse.builder()
            .token(token)
            .expiresIn(3600)
            .user(toUserResponse(user))
            .build();
    }

    public UserResponse register(RegisterRequest request) {
        // Create in LDAP
        ldapUserService.createUser(toLdapUser(request));
        
        // Create in database
        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .role(Role.USER)
            .build();
        
        return toUserResponse(userRepository.save(user));
    }
}
```

---

## 🗄️ Database Schema

```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

---

## 🧪 Testing

```java
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void shouldLoginSuccessfully() throws Exception {
        LoginRequest request = new LoginRequest("user", "password");
        LoginResponse response = LoginResponse.builder()
            .token("jwt-token")
            .expiresIn(3600)
            .build();
        
        when(authService.authenticate(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").value("jwt-token"));
    }
}
```

---

## 📚 Related Docs

- [Java Development Guide](java-development.md)
- [API Reference](api-reference.md)
- [Security Guide](security.md)
