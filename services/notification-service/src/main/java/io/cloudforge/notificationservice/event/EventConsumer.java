package io.cloudforge.notificationservice.event;

import io.cloudforge.notificationservice.dto.NotificationRequest;
import io.cloudforge.notificationservice.model.NotificationChannel;
import io.cloudforge.notificationservice.model.NotificationType;
import io.cloudforge.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "${kafka.topics.order-created}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received order created event: {}", event.getOrderId());

        try {
            Map<String, Object> templateData = Map.of(
                    "customerName", event.getCustomerName() != null ? event.getCustomerName() : "Customer",
                    "orderId", event.getOrderId().toString(),
                    "itemCount", event.getItems() != null ? event.getItems().size() : 0,
                    "totalAmount", event.getTotalAmount().toString(),
                    "shippingAddress", event.getShippingAddress() != null ? event.getShippingAddress() : "",
                    "trackingUrl", "https://cloudforgetech.in/orders/" + event.getOrderId());

            notificationService.sendNotification(NotificationRequest.builder()
                    .userId(event.getUserId())
                    .type(NotificationType.ORDER_CONFIRMATION)
                    .channel(NotificationChannel.EMAIL)
                    .recipient(event.getUserEmail())
                    .referenceId(event.getOrderId().toString())
                    .referenceType("ORDER")
                    .templateData(templateData)
                    .build());

            log.info("Order confirmation notification sent for: {}", event.getOrderId());

        } catch (Exception e) {
            log.error("Failed to send order confirmation for: {}", event.getOrderId(), e);
        }
    }

    @KafkaListener(topics = "${kafka.topics.payment-completed}", groupId = "${spring.kafka.consumer.group-id}")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Received payment completed event: {}", event.getPaymentId());

        try {
            Map<String, Object> templateData = Map.of(
                    "customerName", event.getCustomerName() != null ? event.getCustomerName() : "Customer",
                    "paymentId", event.getPaymentId().toString(),
                    "orderId", event.getOrderId().toString(),
                    "amount", event.getAmount().toString(),
                    "paymentMethod", event.getPaymentMethod() != null ? event.getPaymentMethod() : "Card",
                    "paymentDate", event.getCompletedAt().toString());

            notificationService.sendNotification(NotificationRequest.builder()
                    .userId(event.getUserId())
                    .type(NotificationType.PAYMENT_SUCCESS)
                    .channel(NotificationChannel.EMAIL)
                    .recipient(event.getUserEmail())
                    .referenceId(event.getPaymentId().toString())
                    .referenceType("PAYMENT")
                    .templateData(templateData)
                    .build());

            log.info("Payment success notification sent for: {}", event.getPaymentId());

        } catch (Exception e) {
            log.error("Failed to send payment success notification: {}", event.getPaymentId(), e);
        }
    }

    @KafkaListener(topics = "${kafka.topics.payment-failed}", groupId = "${spring.kafka.consumer.group-id}")
    public void handlePaymentFailed(PaymentFailedEvent event) {
        log.info("Received payment failed event: {}", event.getPaymentId());

        try {
            Map<String, Object> templateData = Map.of(
                    "customerName", event.getCustomerName() != null ? event.getCustomerName() : "Customer",
                    "orderId", event.getOrderId().toString(),
                    "amount", event.getAmount().toString(),
                    "failureReason",
                    event.getFailureReason() != null ? event.getFailureReason() : "Payment could not be completed",
                    "retryUrl", "https://cloudforgetech.in/checkout/" + event.getOrderId());

            notificationService.sendNotification(NotificationRequest.builder()
                    .userId(event.getUserId())
                    .type(NotificationType.PAYMENT_FAILED)
                    .channel(NotificationChannel.EMAIL)
                    .recipient(event.getUserEmail())
                    .referenceId(event.getPaymentId().toString())
                    .referenceType("PAYMENT")
                    .templateData(templateData)
                    .build());

            log.info("Payment failed notification sent for: {}", event.getPaymentId());

        } catch (Exception e) {
            log.error("Failed to send payment failed notification: {}", event.getPaymentId(), e);
        }
    }
}
