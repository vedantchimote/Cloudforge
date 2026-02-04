package io.cloudforge.swaggeraggregator.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
public class ApiDocsProxyController {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final Map<String, String> SERVICE_URLS = Map.of(
            "user-service", "http://localhost:8081",
            "product-service", "http://localhost:8082",
            "order-service", "http://localhost:8083",
            "payment-service", "http://localhost:8084",
            "notification-service", "http://localhost:8085");

    @GetMapping(value = "/api-docs/{serviceName}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> proxyApiDocs(@PathVariable String serviceName) {
        String serviceUrl = SERVICE_URLS.get(serviceName);
        if (serviceUrl == null) {
            return ResponseEntity.notFound().build();
        }

        // Try /v3/api-docs first (standard), then fallback to /api-docs
        String[] apiDocsPaths = { "/v3/api-docs", "/api-docs" };

        for (String path : apiDocsPaths) {
            try {
                String apiDocs = restTemplate.getForObject(serviceUrl + path, String.class);
                if (apiDocs != null && !apiDocs.isEmpty()) {
                    return ResponseEntity.ok(apiDocs);
                }
            } catch (Exception e) {
                // Try next path
            }
        }

        return ResponseEntity.status(503)
                .body("{\"error\": \"Service unavailable: " + serviceName
                        + "\", \"message\": \"Could not fetch API docs from /v3/api-docs or /api-docs\"}");
    }
}
