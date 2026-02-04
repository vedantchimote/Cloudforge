package io.cloudforge.notificationservice.controller;

import io.cloudforge.notificationservice.dto.NotificationRequest;
import io.cloudforge.notificationservice.dto.NotificationResponse;
import io.cloudforge.notificationservice.model.NotificationType;
import io.cloudforge.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Send a notification")
    @PostMapping
    public ResponseEntity<NotificationResponse> sendNotification(
            @Valid @RequestBody NotificationRequest request) {
        log.info("Sending notification to user: {} type: {}", request.getUserId(), request.getType());
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get notification by ID")
    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> getNotification(@PathVariable UUID id) {
        return notificationService.getNotificationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get notifications for a user")
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<NotificationResponse>> getUserNotifications(
            @PathVariable UUID userId,
            Pageable pageable) {
        Page<NotificationResponse> notifications = notificationService.getNotificationsForUser(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get notifications by type for a user")
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<Page<NotificationResponse>> getNotificationsByType(
            @PathVariable UUID userId,
            @PathVariable NotificationType type,
            Pageable pageable) {
        Page<NotificationResponse> notifications = notificationService.getNotificationsByType(userId, type, pageable);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Send welcome email (test endpoint)")
    @PostMapping("/welcome")
    public ResponseEntity<NotificationResponse> sendWelcomeEmail(
            @RequestParam UUID userId,
            @RequestParam String email,
            @RequestParam String name) {
        NotificationResponse response = notificationService.sendWelcomeEmail(userId, email, name);
        return ResponseEntity.ok(response);
    }
}
