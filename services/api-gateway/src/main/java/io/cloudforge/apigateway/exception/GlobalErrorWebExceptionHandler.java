package io.cloudforge.apigateway.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cloudforge.apigateway.dto.ErrorResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * Global error handler for API Gateway
 * Provides consistent error response format across all endpoints
 */
@Component
@Order(-2)
@RequiredArgsConstructor
@Slf4j
public class GlobalErrorWebExceptionHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        String path = exchange.getRequest().getPath().value();
        
        log.error("Error occurred for path: {} - {}: {}", 
                path, ex.getClass().getSimpleName(), ex.getMessage());

        ErrorResponse errorResponse;
        HttpStatus status;

        // Handle different exception types
        if (ex instanceof ResponseStatusException) {
            ResponseStatusException rse = (ResponseStatusException) ex;
            status = HttpStatus.valueOf(rse.getStatusCode().value());
            errorResponse = createErrorResponse(status, rse.getReason(), path);
        } else if (ex instanceof JwtAuthenticationException) {
            status = HttpStatus.UNAUTHORIZED;
            errorResponse = ErrorResponse.unauthorized(ex.getMessage(), path);
        } else if (ex instanceof IllegalArgumentException) {
            status = HttpStatus.BAD_REQUEST;
            errorResponse = ErrorResponse.badRequest(ex.getMessage(), null, path);
        } else {
            // Default to 500 Internal Server Error
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorResponse = ErrorResponse.internalServerError(
                    "An unexpected error occurred. Please try again later.", 
                    path
            );
        }

        // Set response status and content type
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        // Write error response as JSON
        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize error response", e);
            // Fallback to plain text error
            byte[] fallbackBytes = "{\"error\":\"Internal Server Error\",\"message\":\"Failed to process error response\"}"
                    .getBytes(StandardCharsets.UTF_8);
            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(fallbackBytes);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        }
    }

    private ErrorResponse createErrorResponse(HttpStatus status, String message, String path) {
        return switch (status) {
            case UNAUTHORIZED -> ErrorResponse.unauthorized(
                    message != null ? message : "Authentication required", 
                    path
            );
            case FORBIDDEN -> ErrorResponse.forbidden(
                    message != null ? message : "Access denied", 
                    path
            );
            case NOT_FOUND -> ErrorResponse.notFound(
                    message != null ? message : "Resource not found", 
                    path
            );
            case BAD_REQUEST -> ErrorResponse.badRequest(
                    message != null ? message : "Invalid request", 
                    null, 
                    path
            );
            default -> ErrorResponse.internalServerError(
                    message != null ? message : "An unexpected error occurred", 
                    path
            );
        };
    }
}
