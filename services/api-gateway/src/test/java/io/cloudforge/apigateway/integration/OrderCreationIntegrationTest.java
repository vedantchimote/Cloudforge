package io.cloudforge.apigateway.integration;

import io.cloudforge.apigateway.security.JwtTokenProvider;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for order creation flow through API Gateway
 * Tests JWT authentication and request routing
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class OrderCreationIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private String validToken;
    private String expiredToken;
    private String invalidToken;

    @BeforeEach
    void setUp() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        SecretKey signingKey = Keys.hmacShaKeyFor(keyBytes);

        // Create valid token
        validToken = Jwts.builder()
                .subject("testuser")
                .claim("userId", "test-user-id-123")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
                .signWith(signingKey)
                .compact();

        // Create expired token
        expiredToken = Jwts.builder()
                .subject("testuser")
                .claim("userId", "test-user-id-123")
                .issuedAt(new Date(System.currentTimeMillis() - 7200000)) // 2 hours ago
                .expiration(new Date(System.currentTimeMillis() - 3600000)) // 1 hour ago
                .signWith(signingKey)
                .compact();

        // Create token with invalid signature
        String differentSecret = "different-secret-key-that-is-at-least-256-bits-long";
        byte[] differentKeyBytes = differentSecret.getBytes(StandardCharsets.UTF_8);
        SecretKey differentKey = Keys.hmacShaKeyFor(differentKeyBytes);

        invalidToken = Jwts.builder()
                .subject("testuser")
                .claim("userId", "test-user-id-123")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(differentKey)
                .compact();
    }

    @Test
    void createOrder_shouldReturn401WhenNoAuthorizationHeader() {
        // Given
        String orderRequest = """
                {
                    "items": [
                        {
                            "productId": "product-1",
                            "quantity": 2
                        }
                    ],
                    "shippingAddress": "123 Main St",
                    "shippingCity": "Mumbai",
                    "shippingState": "Maharashtra",
                    "shippingZip": "400001",
                    "shippingCountry": "India"
                }
                """;

        // When & Then
        webTestClient.post()
                .uri("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(orderRequest)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.error").isEqualTo("Unauthorized")
                .jsonPath("$.message").exists()
                .jsonPath("$.status").isEqualTo(401);
    }

    @Test
    void createOrder_shouldReturn401WhenTokenIsExpired() {
        // Given
        String orderRequest = """
                {
                    "items": [
                        {
                            "productId": "product-1",
                            "quantity": 2
                        }
                    ],
                    "shippingAddress": "123 Main St",
                    "shippingCity": "Mumbai",
                    "shippingState": "Maharashtra",
                    "shippingZip": "400001",
                    "shippingCountry": "India"
                }
                """;

        // When & Then
        webTestClient.post()
                .uri("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(orderRequest)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.error").isEqualTo("Unauthorized")
                .jsonPath("$.message").exists()
                .jsonPath("$.status").isEqualTo(401);
    }

    @Test
    void createOrder_shouldReturn401WhenTokenHasInvalidSignature() {
        // Given
        String orderRequest = """
                {
                    "items": [
                        {
                            "productId": "product-1",
                            "quantity": 2
                        }
                    ],
                    "shippingAddress": "123 Main St",
                    "shippingCity": "Mumbai",
                    "shippingState": "Maharashtra",
                    "shippingZip": "400001",
                    "shippingCountry": "India"
                }
                """;

        // When & Then
        webTestClient.post()
                .uri("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + invalidToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(orderRequest)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.error").isEqualTo("Unauthorized")
                .jsonPath("$.message").exists()
                .jsonPath("$.status").isEqualTo(401);
    }

    @Test
    void createOrder_shouldReturn401WhenAuthorizationHeaderHasInvalidFormat() {
        // Given
        String orderRequest = """
                {
                    "items": [
                        {
                            "productId": "product-1",
                            "quantity": 2
                        }
                    ],
                    "shippingAddress": "123 Main St",
                    "shippingCity": "Mumbai",
                    "shippingState": "Maharashtra",
                    "shippingZip": "400001",
                    "shippingCountry": "India"
                }
                """;

        // When & Then
        webTestClient.post()
                .uri("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "InvalidFormat " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(orderRequest)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.error").isEqualTo("Unauthorized")
                .jsonPath("$.message").exists()
                .jsonPath("$.status").isEqualTo(401);
    }

    @Test
    void createOrder_shouldPassThroughWithValidToken() {
        // Given
        String orderRequest = """
                {
                    "items": [
                        {
                            "productId": "product-1",
                            "quantity": 2
                        }
                    ],
                    "shippingAddress": "123 Main St",
                    "shippingCity": "Mumbai",
                    "shippingState": "Maharashtra",
                    "shippingZip": "400001",
                    "shippingCountry": "India"
                }
                """;

        // When & Then
        // Note: This will fail if order service is not running, but it should pass through the gateway
        // The test verifies that authentication succeeds and request is forwarded
        webTestClient.post()
                .uri("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(orderRequest)
                .exchange()
                // We expect either success or 503 (service unavailable) if order service is down
                // But NOT 401 (unauthorized)
                .expectStatus().value(status -> assertThat(status).isNotEqualTo(401));
    }

    @Test
    void getProducts_shouldAllowAccessWithoutAuthentication() {
        // When & Then
        webTestClient.get()
                .uri("/api/products")
                .exchange()
                // Should not return 401 - products are public
                .expectStatus().value(status -> assertThat(status).isNotEqualTo(401));
    }

    @Test
    void login_shouldAllowAccessWithoutAuthentication() {
        // Given
        String loginRequest = """
                {
                    "username": "testuser",
                    "password": "password"
                }
                """;

        // When & Then
        webTestClient.post()
                .uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(loginRequest)
                .exchange()
                // Should not return 401 - login is public
                .expectStatus().value(status -> assertThat(status).isNotEqualTo(401));
    }

    @Test
    void swagger_shouldAllowAccessWithoutAuthentication() {
        // When & Then
        webTestClient.get()
                .uri("/swagger-ui/index.html")
                .exchange()
                // Should not return 401 - swagger is public
                .expectStatus().value(status -> assertThat(status).isNotEqualTo(401));
    }
}
