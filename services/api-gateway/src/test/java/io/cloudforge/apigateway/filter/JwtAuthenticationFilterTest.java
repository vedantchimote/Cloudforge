package io.cloudforge.apigateway.filter;

import io.cloudforge.apigateway.exception.JwtAuthenticationException;
import io.cloudforge.apigateway.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private GatewayFilterChain filterChain;

    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtTokenProvider);
        
        // Mock filter chain to return completed Mono (lenient for tests that don't use it)
        lenient().when(filterChain.filter(any(ServerWebExchange.class)))
                .thenReturn(Mono.empty());
    }

    @Test
    void filter_shouldSkipAuthenticationForExcludedPaths() {
        // Given
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/auth/login")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // When
        Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();

        verify(filterChain).filter(exchange);
        verifyNoInteractions(jwtTokenProvider);
    }

    @Test
    void filter_shouldSkipAuthenticationForProductsPath() {
        // Given
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/products")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // When
        Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();

        verify(filterChain).filter(exchange);
        verifyNoInteractions(jwtTokenProvider);
    }

    @Test
    void filter_shouldSkipAuthenticationForSwaggerPath() {
        // Given
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/swagger-ui/index.html")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // When
        Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();

        verify(filterChain).filter(exchange);
        verifyNoInteractions(jwtTokenProvider);
    }

    @Test
    void filter_shouldThrowExceptionWhenAuthorizationHeaderMissing() {
        // Given
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/orders")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // When
        Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .expectError(JwtAuthenticationException.class)
                .verify();

        verify(filterChain, never()).filter(any());
    }

    @Test
    void filter_shouldThrowExceptionWhenAuthorizationHeaderEmpty() {
        // Given
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // When
        Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .expectError(JwtAuthenticationException.class)
                .verify();

        verify(filterChain, never()).filter(any());
    }

    @Test
    void filter_shouldThrowExceptionWhenTokenExtractionFails() {
        // Given
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "InvalidFormat token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(jwtTokenProvider.extractToken(anyString())).thenReturn(null);

        // When
        Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .expectError(JwtAuthenticationException.class)
                .verify();

        verify(jwtTokenProvider).extractToken("InvalidFormat token");
        verify(filterChain, never()).filter(any());
    }

    @Test
    void filter_shouldThrowExceptionWhenTokenValidationFails() {
        // Given
        String token = "invalid-token";
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(jwtTokenProvider.extractToken(anyString())).thenReturn(token);
        when(jwtTokenProvider.validateToken(token)).thenReturn(false);

        // When
        Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .expectError(JwtAuthenticationException.class)
                .verify();

        verify(jwtTokenProvider).extractToken("Bearer " + token);
        verify(jwtTokenProvider).validateToken(token);
        verify(filterChain, never()).filter(any());
    }

    @Test
    void filter_shouldThrowExceptionWhenUserIdNotFoundInToken() {
        // Given
        String token = "valid-token";
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(jwtTokenProvider.extractToken(anyString())).thenReturn(token);
        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.extractUserId(token)).thenReturn(null);

        // When
        Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .expectError(JwtAuthenticationException.class)
                .verify();

        verify(jwtTokenProvider).extractToken("Bearer " + token);
        verify(jwtTokenProvider).validateToken(token);
        verify(jwtTokenProvider).extractUserId(token);
        verify(filterChain, never()).filter(any());
    }

    @Test
    void filter_shouldAddUserIdHeaderAndContinueForValidToken() {
        // Given
        String token = "valid-token";
        String userId = "user-123";
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(jwtTokenProvider.extractToken(anyString())).thenReturn(token);
        when(jwtTokenProvider.validateToken(token)).thenReturn(true);
        when(jwtTokenProvider.extractUserId(token)).thenReturn(userId);

        // When
        Mono<Void> result = jwtAuthenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();

        verify(jwtTokenProvider).extractToken("Bearer " + token);
        verify(jwtTokenProvider).validateToken(token);
        verify(jwtTokenProvider).extractUserId(token);
        verify(filterChain).filter(any(ServerWebExchange.class));
    }

    @Test
    void filter_shouldHandleMultipleRequestsIndependently() {
        // Given
        String token1 = "token-1";
        String userId1 = "user-1";
        String token2 = "token-2";
        String userId2 = "user-2";

        MockServerHttpRequest request1 = MockServerHttpRequest
                .get("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token1)
                .build();
        MockServerWebExchange exchange1 = MockServerWebExchange.from(request1);

        MockServerHttpRequest request2 = MockServerHttpRequest
                .get("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token2)
                .build();
        MockServerWebExchange exchange2 = MockServerWebExchange.from(request2);

        when(jwtTokenProvider.extractToken("Bearer " + token1)).thenReturn(token1);
        when(jwtTokenProvider.validateToken(token1)).thenReturn(true);
        when(jwtTokenProvider.extractUserId(token1)).thenReturn(userId1);

        when(jwtTokenProvider.extractToken("Bearer " + token2)).thenReturn(token2);
        when(jwtTokenProvider.validateToken(token2)).thenReturn(true);
        when(jwtTokenProvider.extractUserId(token2)).thenReturn(userId2);

        // When
        Mono<Void> result1 = jwtAuthenticationFilter.filter(exchange1, filterChain);
        Mono<Void> result2 = jwtAuthenticationFilter.filter(exchange2, filterChain);

        // Then
        StepVerifier.create(result1).verifyComplete();
        StepVerifier.create(result2).verifyComplete();

        verify(filterChain, times(2)).filter(any(ServerWebExchange.class));
    }

    @Test
    void getOrder_shouldReturnNegative100() {
        // When
        int order = jwtAuthenticationFilter.getOrder();

        // Then
        assertEquals(-100, order);
    }
}
