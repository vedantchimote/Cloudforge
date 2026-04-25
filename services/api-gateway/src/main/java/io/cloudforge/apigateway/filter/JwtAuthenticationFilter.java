package io.cloudforge.apigateway.filter;

import io.cloudforge.apigateway.exception.JwtAuthenticationException;
import io.cloudforge.apigateway.security.JwtTokenProvider;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtTokenProvider jwtTokenProvider;

    // Paths that don't require authentication
    private static final List<String> EXCLUDED_PATHS = List.of(
            "/api/auth",
            "/api/products",
            "/v3/api-docs",
            "/swagger-ui",
            "/webjars",
            "/actuator"
    );

    @PostConstruct
    public void init() {
        log.info("=== JWT Authentication Filter initialized ===");
        log.info("Excluded paths: {}", EXCLUDED_PATHS);
        log.info("Filter order: {}", getOrder());
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        log.info("JWT Filter processing request: {}", path);

        // Skip authentication for excluded paths
        if (isExcludedPath(path)) {
            log.info("Skipping authentication for excluded path: {}", path);
            return chain.filter(exchange);
        }

        try {
            // Extract Authorization header
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            
            if (authHeader == null || authHeader.isEmpty()) {
                log.warn("Missing Authorization header for path: {}", path);
                throw new JwtAuthenticationException("Missing or invalid authentication token");
            }

            // Extract JWT token
            String token = jwtTokenProvider.extractToken(authHeader);
            if (token == null) {
                log.warn("Invalid Authorization header format for path: {}", path);
                throw new JwtAuthenticationException("Invalid Authorization header format. Expected: Bearer <token>");
            }

            log.info("Extracted JWT token (first 30 chars): {}", token.substring(0, Math.min(30, token.length())));

            // Validate token
            if (!jwtTokenProvider.validateToken(token)) {
                log.error("JWT token validation FAILED for path: {}", path);
                throw new JwtAuthenticationException("Invalid or expired authentication token");
            }
            
            log.info("JWT token validation PASSED for path: {}", path);

            // Extract user ID from token
            String userId = jwtTokenProvider.extractUserId(token);
            if (userId == null) {
                log.warn("User ID not found in JWT token for path: {}", path);
                throw new JwtAuthenticationException("User ID not found in authentication token");
            }

            // Add X-User-Id header to downstream request
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", userId)
                    .build();

            log.info("Added X-User-Id header: {} for path: {}", userId, path);

            // Continue with modified request
            return chain.filter(exchange.mutate().request(modifiedRequest).build());
            
        } catch (JwtAuthenticationException e) {
            // Re-throw to be handled by GlobalErrorWebExceptionHandler
            return Mono.error(e);
        } catch (Exception e) {
            log.error("Unexpected error during JWT authentication for path: {}", path, e);
            return Mono.error(new JwtAuthenticationException("Authentication failed due to an unexpected error", e));
        }
    }

    private boolean isExcludedPath(String path) {
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    public int getOrder() {
        return -100; // Execute before other filters
    }
}
