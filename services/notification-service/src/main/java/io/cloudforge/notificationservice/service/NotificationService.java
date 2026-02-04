package io.cloudforge.notificationservice.service;

import io.cloudforge.notificationservice.dto.NotificationRequest;
import io.cloudforge.notificationservice.dto.NotificationResponse;
import io.cloudforge.notificationservice.model.Notification;
import io.cloudforge.notificationservice.model.NotificationChannel;
import io.cloudforge.notificationservice.model.NotificationStatus;
import io.cloudforge.notificationservice.model.NotificationType;
import io.cloudforge.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final TemplateService templateService;

    @Value("${notification.retry-attempts:3}")
    private int maxRetryAttempts;

    /**
     * Send a notification (email, SMS, push) based on the request.
     */
    public NotificationResponse sendNotification(NotificationRequest request) {
        log.info("Processing notification request for user: {} type: {}",
                request.getUserId(), request.getType());

        // Determine subject from template if not provided
        String subject = request.getSubject();
        if (subject == null || subject.isBlank()) {
            subject = templateService.getSubjectForType(
                    request.getType().name(),
                    request.getTemplateData());
        }

        // Render content from template if not provided
        String content = request.getContent();
        if ((content == null || content.isBlank()) && request.getTemplateData() != null) {
            String templateName = templateService.getTemplateForType(request.getType().name());
            content = templateService.renderTemplate(templateName, request.getTemplateData());
        }

        // Create notification record
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .channel(request.getChannel())
                .subject(subject)
                .content(content)
                .recipient(request.getRecipient())
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .status(NotificationStatus.PENDING)
                .build();

        notification = notificationRepository.save(notification);

        // Send based on channel
        if (request.getChannel() == NotificationChannel.EMAIL) {
            sendEmailNotification(notification);
        } else {
            // For SMS, PUSH, IN_APP - mark as pending for future implementation
            log.info("Channel {} not yet implemented, marking as pending", request.getChannel());
        }

        return NotificationResponse.fromNotification(notificationRepository.save(notification));
    }

    /**
     * Send email notification with retry logic.
     */
    @Async
    public void sendEmailNotification(Notification notification) {
        notification.setStatus(NotificationStatus.SENDING);
        notificationRepository.save(notification);

        try {
            emailService.sendEmail(
                    notification.getRecipient(),
                    notification.getSubject(),
                    notification.getContent());

            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(Instant.now());
            log.info("Email sent successfully: {}", notification.getId());

        } catch (Exception e) {
            log.error("Failed to send email notification: {}", notification.getId(), e);
            handleSendFailure(notification, e.getMessage());
        }

        notificationRepository.save(notification);
    }

    /**
     * Handle send failure with retry logic.
     */
    private void handleSendFailure(Notification notification, String errorMessage) {
        notification.setRetryCount(notification.getRetryCount() + 1);
        notification.setErrorMessage(errorMessage);

        if (notification.getRetryCount() >= maxRetryAttempts) {
            notification.setStatus(NotificationStatus.FAILED);
            log.error("Notification {} failed after {} attempts", notification.getId(), maxRetryAttempts);
        } else {
            notification.setStatus(NotificationStatus.RETRYING);
            log.warn("Notification {} will be retried (attempt {})", notification.getId(),
                    notification.getRetryCount());
        }
    }

    /**
     * Scheduled job to retry failed notifications.
     */
    @Scheduled(fixedDelayString = "60000") // Run every minute
    public void retryFailedNotifications() {
        List<Notification> toRetry = notificationRepository
                .findByStatusAndRetryCountLessThan(NotificationStatus.RETRYING, maxRetryAttempts);

        if (!toRetry.isEmpty()) {
            log.info("Retrying {} failed notifications", toRetry.size());
            toRetry.forEach(this::sendEmailNotification);
        }
    }

    /**
     * Get notification by ID.
     */
    @Transactional(readOnly = true)
    public Optional<NotificationResponse> getNotificationById(UUID id) {
        return notificationRepository.findById(id)
                .map(NotificationResponse::fromNotification);
    }

    /**
     * Get notifications for a user.
     */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotificationsForUser(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable)
                .map(NotificationResponse::fromNotification);
    }

    /**
     * Get notifications by type for a user.
     */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotificationsByType(UUID userId, NotificationType type, Pageable pageable) {
        return notificationRepository.findByUserIdAndType(userId, type, pageable)
                .map(NotificationResponse::fromNotification);
    }

    /**
     * Send notification for order confirmation.
     */
    public NotificationResponse sendOrderConfirmation(UUID userId, String email, UUID orderId,
            String customerName, int itemCount,
            String totalAmount, String shippingAddress) {
        Map<String, Object> templateData = Map.of(
                "customerName", customerName,
                "orderId", orderId.toString(),
                "itemCount", itemCount,
                "totalAmount", totalAmount,
                "shippingAddress", shippingAddress,
                "trackingUrl", "https://cloudforgetech.in/orders/" + orderId);

        return sendNotification(NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.ORDER_CONFIRMATION)
                .channel(NotificationChannel.EMAIL)
                .recipient(email)
                .referenceId(orderId.toString())
                .referenceType("ORDER")
                .templateData(templateData)
                .build());
    }

    /**
     * Send notification for payment success.
     */
    public NotificationResponse sendPaymentSuccess(UUID userId, String email, UUID paymentId,
            UUID orderId, String customerName,
            String amount, String paymentMethod) {
        Map<String, Object> templateData = Map.of(
                "customerName", customerName,
                "paymentId", paymentId.toString(),
                "orderId", orderId.toString(),
                "amount", amount,
                "paymentMethod", paymentMethod,
                "paymentDate", Instant.now().toString());

        return sendNotification(NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.PAYMENT_SUCCESS)
                .channel(NotificationChannel.EMAIL)
                .recipient(email)
                .referenceId(paymentId.toString())
                .referenceType("PAYMENT")
                .templateData(templateData)
                .build());
    }

    /**
     * Send welcome email to new user.
     */
    public NotificationResponse sendWelcomeEmail(UUID userId, String email, String customerName) {
        Map<String, Object> templateData = Map.of(
                "customerName", customerName,
                "loginUrl", "https://cloudforgetech.in/login");

        return sendNotification(NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.WELCOME)
                .channel(NotificationChannel.EMAIL)
                .recipient(email)
                .referenceId(userId.toString())
                .referenceType("USER")
                .templateData(templateData)
                .build());
    }
}
