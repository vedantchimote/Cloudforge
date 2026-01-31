# Java/Spring Boot Development Guide

Complete guide for developing CloudForge backend microservices.

---

## 🛠️ Development Environment Setup

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| JDK | 17+ | [Adoptium](https://adoptium.net/) |
| Maven | 3.8+ | [Maven](https://maven.apache.org/) |
| Docker | Latest | [Docker Desktop](https://docker.com/desktop) |
| IDE | IntelliJ IDEA / VS Code | - |

### IDE Setup

#### IntelliJ IDEA (Recommended)
1. Install plugins: Lombok, SonarLint, Spring Boot Assistant
2. Enable annotation processing: Settings → Build → Compiler → Annotation Processors
3. Import as Maven project

#### VS Code
1. Install Extension Pack for Java
2. Install Spring Boot Extension Pack
3. Install Lombok Annotations Support

---

## 📁 Project Structure

```
services/user-service/
├── src/
│   ├── main/
│   │   ├── java/com/cloudforge/user/
│   │   │   ├── UserServiceApplication.java
│   │   │   ├── controller/
│   │   │   │   └── UserController.java
│   │   │   ├── service/
│   │   │   │   ├── UserService.java
│   │   │   │   └── impl/UserServiceImpl.java
│   │   │   ├── repository/
│   │   │   │   └── UserRepository.java
│   │   │   ├── model/
│   │   │   │   └── User.java
│   │   │   ├── dto/
│   │   │   │   ├── UserRequest.java
│   │   │   │   └── UserResponse.java
│   │   │   ├── mapper/
│   │   │   │   └── UserMapper.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── OpenApiConfig.java
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java
│   │   │       └── UserNotFoundException.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-docker.yml
│   │       └── db/migration/
│   │           └── V1__initial_schema.sql
│   └── test/
│       └── java/com/cloudforge/user/
│           ├── controller/
│           ├── service/
│           └── repository/
├── Dockerfile
└── pom.xml
```

---

## 🚀 Running Locally

### Start Dependencies
```bash
# Start PostgreSQL, Redis, LDAP
docker-compose up -d postgres ldap redis
```

### Run Service
```bash
cd services/user-service

# Using Maven
./mvnw spring-boot:run

# With specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Debug mode
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:5005"
```

### Verify
```bash
# Health check
curl http://localhost:8081/actuator/health

# Swagger UI
open http://localhost:8081/swagger-ui.html
```

---

## 📝 Coding Patterns

### Controller Layer
```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> getUser(
            @PathVariable @NotNull UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create new user")
    public ResponseEntity<UserResponse> createUser(
            @RequestBody @Valid UserRequest request) {
        UserResponse created = userService.create(request);
        return ResponseEntity
            .created(URI.create("/api/users/" + created.getId()))
            .body(created);
    }
}
```

### Service Layer
```java
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse findById(UUID id) {
        return userRepository.findById(id)
            .map(userMapper::toResponse)
            .orElseThrow(() -> new UserNotFoundException(id));
    }

    @Override
    public UserResponse create(UserRequest request) {
        log.info("Creating user: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        User saved = userRepository.save(user);
        log.info("Created user with ID: {}", saved.getId());
        
        return userMapper.toResponse(saved);
    }
}
```

### Repository Layer
```java
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.enabled = true")
    List<User> findActiveByRole(@Param("role") String role);
}
```

### Entity
```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    private boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
```

### DTO with Validation
```java
@Data
@Builder
public class UserRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    
    @Size(max = 100)
    private String firstName;
    
    @Size(max = 100)
    private String lastName;
}

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Instant createdAt;
}
```

### Mapper (MapStruct)
```java
@Mapper(componentModel = "spring")
public interface UserMapper {
    
    UserResponse toResponse(User user);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(UserRequest request);
}
```

### Exception Handler
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(UserNotFoundException ex) {
        log.warn("User not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> new FieldError(e.getField(), e.getDefaultMessage()))
            .toList();
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "Validation Failed", errors));
    }
}
```

---

## 🧪 Testing

### Unit Test
```java
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private UserMapper userMapper;
    
    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void shouldCreateUser() {
        // Given
        UserRequest request = UserRequest.builder()
            .email("test@example.com")
            .password("password123")
            .build();
        User user = new User();
        user.setId(UUID.randomUUID());
        
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userMapper.toEntity(request)).thenReturn(user);
        when(userRepository.save(any())).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(new UserResponse());

        // When
        UserResponse response = userService.create(request);

        // Then
        assertThat(response).isNotNull();
        verify(userRepository).save(any());
    }
}
```

### Integration Test
```java
@SpringBootTest
@Testcontainers
@AutoConfigureTestDatabase(replace = Replace.NONE)
class UserRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldPersistUser() {
        User user = User.builder()
            .email("test@example.com")
            .passwordHash("hash")
            .build();

        User saved = userRepository.save(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
    }
}
```

### Run Tests
```bash
# All tests
./mvnw test

# With coverage
./mvnw verify -Pcoverage

# Specific test class
./mvnw test -Dtest=UserServiceImplTest
```

---

## 🔧 Configuration

### application.yml
```yaml
spring:
  application:
    name: user-service
  
  datasource:
    url: jdbc:postgresql://localhost:5432/cloudforge
    username: ${DB_USERNAME:cloudforge}
    password: ${DB_PASSWORD:cloudforge123}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5

  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    properties:
      hibernate:
        format_sql: true

  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: 8081

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
  endpoint:
    health:
      show-details: always

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
```

---

## 📦 Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>

    <!-- Tools -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.5.5.Final</version>
    </dependency>

    <!-- Observability -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>

    <!-- API Docs -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 🐳 Dockerfile

```dockerfile
# Build stage
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 🔍 Debugging

### IntelliJ Remote Debug
1. Run with debug flags (see above)
2. Create Remote JVM Debug configuration
3. Set port to 5005

### Logging
```yaml
logging:
  level:
    com.cloudforge: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
```

---

## 📚 Related Docs

- [Code Style Guide](code-style-guide.md)
- [Testing Strategy](testing-strategy.md)
- [API Reference](api-reference.md)

---

## 🔐 LDAP Authentication

### Dependencies
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ldap</groupId>
    <artifactId>spring-ldap-core</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-ldap</artifactId>
</dependency>
```

### Configuration
```yaml
# application.yml
ldap:
  url: ldap://localhost:389
  base: dc=cloudforge,dc=io
  user-dn-pattern: uid={0},ou=users
  group-search-base: ou=groups
  password-attribute: userPassword
```

### Security Config
```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${ldap.url}")
    private String ldapUrl;
    
    @Value("${ldap.base}")
    private String ldapBase;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**", "/swagger-ui/**", "/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults())
            .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public LdapAuthoritiesPopulator ldapAuthoritiesPopulator(
            BaseLdapPathContextSource contextSource) {
        DefaultLdapAuthoritiesPopulator populator = 
            new DefaultLdapAuthoritiesPopulator(contextSource, "ou=groups");
        populator.setGroupSearchFilter("member={0}");
        populator.setRolePrefix("ROLE_");
        return populator;
    }

    @Autowired
    public void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.ldapAuthentication()
            .userDnPatterns("uid={0},ou=users")
            .groupSearchBase("ou=groups")
            .contextSource()
                .url(ldapUrl + "/" + ldapBase)
            .and()
            .passwordCompare()
                .passwordEncoder(new BCryptPasswordEncoder())
                .passwordAttribute("userPassword");
    }
}
```

### LDAP User Details Service
```java
@Service
@RequiredArgsConstructor
public class LdapUserService {

    private final LdapTemplate ldapTemplate;

    public Optional<LdapUser> findByUsername(String username) {
        try {
            LdapUser user = ldapTemplate.findOne(
                query().where("uid").is(username),
                LdapUser.class
            );
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void createUser(LdapUser user) {
        ldapTemplate.create(user);
    }
}

@Entry(objectClasses = {"inetOrgPerson", "top"})
@Data
public class LdapUser {
    @Id
    private Name dn;
    
    @Attribute(name = "uid")
    private String username;
    
    @Attribute(name = "cn")
    private String fullName;
    
    @Attribute(name = "mail")
    private String email;
    
    @Attribute(name = "userPassword")
    private String password;
}
```

### JWT Token Generation
```java
@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration:3600}")
    private long expiration;

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));
            
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

---

## 📨 Kafka Integration

### Dependencies
```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
<dependency>
    <groupId>io.confluent</groupId>
    <artifactId>kafka-avro-serializer</artifactId>
    <version>7.5.0</version>
</dependency>
```

### Configuration
```yaml
# application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: ${spring.application.name}
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: com.cloudforge.*
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

kafka:
  topics:
    order-created: cloudforge.orders.created
    payment-completed: cloudforge.payments.completed
    notification-request: cloudforge.notifications.request
```

### Kafka Config
```java
@Configuration
@EnableKafka
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public NewTopic orderCreatedTopic() {
        return TopicBuilder.name("cloudforge.orders.created")
            .partitions(3)
            .replicas(1)
            .build();
    }

    @Bean
    public NewTopic paymentCompletedTopic() {
        return TopicBuilder.name("cloudforge.payments.completed")
            .partitions(3)
            .replicas(1)
            .build();
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(
            ProducerFactory<String, Object> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }
}
```

### Event Classes
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedEvent {
    private UUID orderId;
    private UUID userId;
    private BigDecimal totalAmount;
    private List<OrderItem> items;
    private Instant createdAt;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCompletedEvent {
    private UUID paymentId;
    private UUID orderId;
    private UUID userId;
    private String status;
    private BigDecimal amount;
    private Instant completedAt;
}
```

### Producer Service
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.order-created}")
    private String orderCreatedTopic;

    public void publishOrderCreated(OrderCreatedEvent event) {
        log.info("Publishing order created event: {}", event.getOrderId());
        
        kafkaTemplate.send(orderCreatedTopic, event.getOrderId().toString(), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish event", ex);
                } else {
                    log.info("Event published successfully to partition {}",
                        result.getRecordMetadata().partition());
                }
            });
    }
}
```

### Consumer Service
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
        topics = "${kafka.topics.order-created}",
        groupId = "notification-service"
    )
    public void handleOrderCreated(
            @Payload OrderCreatedEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        log.info("Received order created event: {} from partition {} offset {}",
            event.getOrderId(), partition, offset);
        
        try {
            notificationService.sendOrderConfirmation(event);
        } catch (Exception e) {
            log.error("Failed to process event", e);
            throw e; // Will trigger retry
        }
    }

    @KafkaListener(topics = "${kafka.topics.payment-completed}")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received payment completed event: {}", event.getPaymentId());
        notificationService.sendPaymentConfirmation(event);
    }
}
```

### Dead Letter Queue
```java
@Bean
public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory(
        ConsumerFactory<String, Object> consumerFactory,
        KafkaTemplate<String, Object> kafkaTemplate) {
    
    ConcurrentKafkaListenerContainerFactory<String, Object> factory =
        new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(consumerFactory);
    
    // Retry 3 times with 1 second delay
    factory.setCommonErrorHandler(new DefaultErrorHandler(
        new DeadLetterPublishingRecoverer(kafkaTemplate),
        new FixedBackOff(1000L, 3)
    ));
    
    return factory;
}
```

---

## 💾 Redis Caching

### Dependencies
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

### Configuration
```yaml
# application.yml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: ${REDIS_PASSWORD:}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 10
          max-idle: 5
          min-idle: 2

cache:
  ttl:
    products: 300  # 5 minutes
    users: 600     # 10 minutes
    sessions: 1800 # 30 minutes
```

### Redis Config
```java
@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${cache.ttl.products:300}")
    private long productsTtl;

    @Value("${cache.ttl.users:600}")
    private long usersTtl;

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("products", defaultConfig.entryTtl(Duration.ofSeconds(productsTtl)));
        cacheConfigs.put("users", defaultConfig.entryTtl(Duration.ofSeconds(usersTtl)));

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(cacheConfigs)
            .build();
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

### Using @Cacheable
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Cacheable(value = "products", key = "#id")
    public ProductResponse findById(String id) {
        log.info("Fetching product from database: {}", id);
        return productRepository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    @Override
    @Cacheable(value = "products", key = "'all:' + #pageable.pageNumber")
    public Page<ProductResponse> findAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @CacheEvict(value = "products", key = "#id")
    public void deleteById(String id) {
        productRepository.deleteById(id);
    }

    @Override
    @CachePut(value = "products", key = "#result.id")
    public ProductResponse update(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));
        // Update fields
        return toResponse(productRepository.save(product));
    }

    @CacheEvict(value = "products", allEntries = true)
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void evictAllCaches() {
        log.info("Evicting all product caches");
    }
}
```

### Idempotency with Redis
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class IdempotencyService {

    private final RedisTemplate<String, String> redisTemplate;
    
    private static final String IDEMPOTENCY_PREFIX = "idempotency:";
    private static final long TTL_HOURS = 24;

    public boolean isProcessed(String idempotencyKey) {
        String key = IDEMPOTENCY_PREFIX + idempotencyKey;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public void markAsProcessed(String idempotencyKey, String result) {
        String key = IDEMPOTENCY_PREFIX + idempotencyKey;
        redisTemplate.opsForValue().set(key, result, TTL_HOURS, TimeUnit.HOURS);
    }

    public Optional<String> getResult(String idempotencyKey) {
        String key = IDEMPOTENCY_PREFIX + idempotencyKey;
        return Optional.ofNullable(redisTemplate.opsForValue().get(key));
    }
}

// Usage in Payment Service
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final IdempotencyService idempotencyService;

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        String idempotencyKey = request.getIdempotencyKey();
        
        // Check if already processed
        if (idempotencyService.isProcessed(idempotencyKey)) {
            return idempotencyService.getResult(idempotencyKey)
                .map(json -> objectMapper.readValue(json, PaymentResponse.class))
                .orElseThrow();
        }
        
        // Process payment
        PaymentResponse response = doProcessPayment(request);
        
        // Mark as processed
        idempotencyService.markAsProcessed(idempotencyKey, 
            objectMapper.writeValueAsString(response));
        
        return response;
    }
}
```

### Session Management
```java
@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
public class SessionConfig {
    // Sessions stored in Redis with 30-minute TTL
}
```

