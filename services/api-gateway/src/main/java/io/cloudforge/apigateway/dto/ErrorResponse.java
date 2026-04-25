package io.cloudforge.apigateway.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard error response format for API Gateway
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    private String error;
    private String message;
    private List<String> errors;
    private String path;
    private int status;
    private LocalDateTime timestamp;
    
    /**
     * Create error response for authentication failures
     */
    public static ErrorResponse unauthorized(String message, String path) {
        return ErrorResponse.builder()
                .error("Unauthorized")
                .message(message)
                .path(path)
                .status(401)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create error response for validation failures
     */
    public static ErrorResponse badRequest(String message, List<String> errors, String path) {
        return ErrorResponse.builder()
                .error("Bad Request")
                .message(message)
                .errors(errors)
                .path(path)
                .status(400)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create error response for server errors
     */
    public static ErrorResponse internalServerError(String message, String path) {
        return ErrorResponse.builder()
                .error("Internal Server Error")
                .message(message)
                .path(path)
                .status(500)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create error response for forbidden access
     */
    public static ErrorResponse forbidden(String message, String path) {
        return ErrorResponse.builder()
                .error("Forbidden")
                .message(message)
                .path(path)
                .status(403)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create error response for not found
     */
    public static ErrorResponse notFound(String message, String path) {
        return ErrorResponse.builder()
                .error("Not Found")
                .message(message)
                .path(path)
                .status(404)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
