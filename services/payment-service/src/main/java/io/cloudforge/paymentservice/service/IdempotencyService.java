package io.cloudforge.paymentservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdempotencyService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String IDEMPOTENCY_PREFIX = "idempotency:";

    @Value("${idempotency.ttl-hours:24}")
    private int ttlHours;

    /**
     * Check if a request with this idempotency key has already been processed.
     */
    public boolean isProcessed(String idempotencyKey) {
        String key = IDEMPOTENCY_PREFIX + idempotencyKey;
        Boolean exists = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }

    /**
     * Retrieve the cached result for a processed request.
     */
    public <T> T getResult(String idempotencyKey, Class<T> responseType) {
        String key = IDEMPOTENCY_PREFIX + idempotencyKey;
        String json = redisTemplate.opsForValue().get(key);

        if (json == null) {
            return null;
        }

        try {
            return objectMapper.readValue(json, responseType);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize cached result for key: {}", idempotencyKey, e);
            return null;
        }
    }

    /**
     * Store the result of a processed request for idempotency.
     */
    public <T> void markAsProcessed(String idempotencyKey, T result) {
        String key = IDEMPOTENCY_PREFIX + idempotencyKey;

        try {
            String json = objectMapper.writeValueAsString(result);
            redisTemplate.opsForValue().set(key, json, ttlHours, TimeUnit.HOURS);
            log.debug("Stored idempotency result for key: {}", idempotencyKey);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize result for idempotency key: {}", idempotencyKey, e);
        }
    }

    /**
     * Remove an idempotency key (useful for cleanup or retry scenarios).
     */
    public void invalidate(String idempotencyKey) {
        String key = IDEMPOTENCY_PREFIX + idempotencyKey;
        redisTemplate.delete(key);
        log.debug("Invalidated idempotency key: {}", idempotencyKey);
    }
}
