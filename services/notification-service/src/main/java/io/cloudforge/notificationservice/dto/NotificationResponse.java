package io.cloudforge.notificationservice.dto;

import io.cloudforge.notificationservice.model.Notification;
import io.cloudforge.notificationservice.model.NotificationChannel;
import io.cloudforge.notificationservice.model.NotificationStatus;
import io.cloudforge.notificationservice.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private UUID userId;
    private NotificationType type;
    private NotificationChannel channel;
    private String subject;
    private String recipient;
    private NotificationStatus status;
    private String referenceId;
    private String referenceType;
    private Integer retryCount;
    private String errorMessage;
    private Instant sentAt;
    private Instant createdAt;

    public static NotificationResponse fromNotification(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .channel(notification.getChannel())
                .subject(notification.getSubject())
                .recipient(notification.getRecipient())
                .status(notification.getStatus())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .retryCount(notification.getRetryCount())
                .errorMessage(notification.getErrorMessage())
                .sentAt(notification.getSentAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
