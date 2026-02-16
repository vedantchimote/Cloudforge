package io.cloudforge.apigateway.filter;

import io.cloudforge.apigateway.security.JwtTokenProvider;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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

        // Extract Authorization header
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        
        if (authHeader == null || authHeader.isEmpty()) {
            log.warn("Missing Authorization header for path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // Extract JWT token
        String token = jwtTokenProvider.extractToken(authHeader);
        if (token == null) {
            log.warn("Invalid Authorization header format for path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        log.info("Extracted JWT token (first 30 chars): {}", token.substring(0, Math.min(30, token.length())));

        // Validate token
        if (!jwtTokenProvider.validateToken(token)) {
            log.error("JWT token validation FAILED for path: {}. Check API Gateway logs for detailed error.", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        
        log.info("JWT token validation PASSED for path: {}", path);

        // Extract user ID from token
        String userId = jwtTokenProvider.extractUserId(token);
        if (userId == null) {
            log.warn("User ID not found in JWT token for path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // Add X-User-Id header to downstream request
        ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Id", userId)
                .build();

        log.info("Added X-User-Id header: {} for path: {}", userId, path);

        // Continue with modified request
        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }

    private boolean isExcludedPath(String path) {
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    public int getOrder() {
        return -100; // Execute before other filters
    }
}
