package io.cloudforge.apigateway.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private String testSecret;
    private SecretKey signingKey;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        testSecret = "test-secret-key-that-is-at-least-256-bits-long-for-hs256-algorithm";
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", testSecret);
        
        byte[] keyBytes = testSecret.getBytes(StandardCharsets.UTF_8);
        signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    @Test
    void extractToken_shouldExtractTokenFromBearerHeader() {
        // Given
        String token = "test-jwt-token";
        String authHeader = "Bearer " + token;

        // When
        String extractedToken = jwtTokenProvider.extractToken(authHeader);

        // Then
        assertEquals(token, extractedToken);
    }

    @Test
    void extractToken_shouldReturnNullForInvalidFormat() {
        // Given
        String authHeader = "InvalidFormat token";

        // When
        String extractedToken = jwtTokenProvider.extractToken(authHeader);

        // Then
        assertNull(extractedToken);
    }

    @Test
    void extractToken_shouldReturnNullForNullHeader() {
        // When
        String extractedToken = jwtTokenProvider.extractToken(null);

        // Then
        assertNull(extractedToken);
    }

    @Test
    void extractToken_shouldReturnNullForEmptyHeader() {
        // When
        String extractedToken = jwtTokenProvider.extractToken("");

        // Then
        assertNull(extractedToken);
    }

    @Test
    void validateToken_shouldReturnTrueForValidToken() {
        // Given
        String userId = "test-user-id";
        String token = createValidToken(userId);

        // When
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Then
        assertTrue(isValid);
    }

    @Test
    void validateToken_shouldReturnFalseForExpiredToken() {
        // Given
        String userId = "test-user-id";
        String token = createExpiredToken(userId);

        // When
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Then
        assertFalse(isValid);
    }

    @Test
    void validateToken_shouldReturnFalseForInvalidSignature() {
        // Given
        String userId = "test-user-id";
        String token = createTokenWithInvalidSignature(userId);

        // When
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Then
        assertFalse(isValid);
    }

    @Test
    void validateToken_shouldReturnFalseForMalformedToken() {
        // Given
        String malformedToken = "not.a.valid.jwt.token";

        // When
        boolean isValid = jwtTokenProvider.validateToken(malformedToken);

        // Then
        assertFalse(isValid);
    }

    @Test
    void validateToken_shouldReturnFalseForNullToken() {
        // When
        boolean isValid = jwtTokenProvider.validateToken(null);

        // Then
        assertFalse(isValid);
    }

    @Test
    void extractUserId_shouldExtractUserIdFromValidToken() {
        // Given
        String userId = "test-user-id-123";
        String token = createValidToken(userId);

        // When
        String extractedUserId = jwtTokenProvider.extractUserId(token);

        // Then
        assertEquals(userId, extractedUserId);
    }

    @Test
    void extractUserId_shouldReturnNullForTokenWithoutUserId() {
        // Given
        String token = createTokenWithoutUserId();

        // When
        String extractedUserId = jwtTokenProvider.extractUserId(token);

        // Then
        assertNull(extractedUserId);
    }

    @Test
    void extractUserId_shouldReturnNullForInvalidToken() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        String extractedUserId = jwtTokenProvider.extractUserId(invalidToken);

        // Then
        assertNull(extractedUserId);
    }

    @Test
    void extractUsername_shouldExtractUsernameFromValidToken() {
        // Given
        String username = "testuser";
        String token = createTokenWithUsername(username);

        // When
        String extractedUsername = jwtTokenProvider.extractUsername(token);

        // Then
        assertEquals(username, extractedUsername);
    }

    @Test
    void extractUsername_shouldReturnNullForInvalidToken() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        String extractedUsername = jwtTokenProvider.extractUsername(invalidToken);

        // Then
        assertNull(extractedUsername);
    }

    // Helper methods to create test tokens

    private String createValidToken(String userId) {
        return Jwts.builder()
                .subject("testuser")
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
                .signWith(signingKey)
                .compact();
    }

    private String createExpiredToken(String userId) {
        return Jwts.builder()
                .subject("testuser")
                .claim("userId", userId)
                .issuedAt(new Date(System.currentTimeMillis() - 7200000)) // 2 hours ago
                .expiration(new Date(System.currentTimeMillis() - 3600000)) // 1 hour ago
                .signWith(signingKey)
                .compact();
    }

    private String createTokenWithInvalidSignature(String userId) {
        // Create token with different secret
        String differentSecret = "different-secret-key-that-is-at-least-256-bits-long-for-hs256";
        byte[] keyBytes = differentSecret.getBytes(StandardCharsets.UTF_8);
        SecretKey differentKey = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject("testuser")
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(differentKey)
                .compact();
    }

    private String createTokenWithoutUserId() {
        return Jwts.builder()
                .subject("testuser")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(signingKey)
                .compact();
    }

    private String createTokenWithUsername(String username) {
        return Jwts.builder()
                .subject(username)
                .claim("userId", "test-user-id")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(signingKey)
                .compact();
    }
}
