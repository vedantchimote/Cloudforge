package io.cloudforge.notificationservice.dto;

import io.cloudforge.notificationservice.model.NotificationChannel;
import io.cloudforge.notificationservice.model.NotificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @NotNull(message = "Channel is required")
    @Builder.Default
    private NotificationChannel channel = NotificationChannel.EMAIL;

    @NotBlank(message = "Recipient is required")
    @Email(message = "Invalid email format")
    private String recipient;

    private String subject;

    private String content;

    private String referenceId;

    private String referenceType;

    // Template variables for dynamic content
    private Map<String, Object> templateData;
}
