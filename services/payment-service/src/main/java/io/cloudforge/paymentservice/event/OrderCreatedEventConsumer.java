package io.cloudforge.paymentservice.event;

import io.cloudforge.paymentservice.dto.PaymentRequest;
import io.cloudforge.paymentservice.model.PaymentMethod;
import io.cloudforge.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCreatedEventConsumer {

    private final PaymentService paymentService;

    @KafkaListener(topics = "${kafka.topics.order-created}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received order created event: {}", event.getOrderId());

        try {
            // Auto-initiate payment for orders
            PaymentRequest request = PaymentRequest.builder()
                    .orderId(event.getOrderId())
                    .userId(event.getUserId())
                    .amount(event.getTotalAmount())
                    .currency("INR")
                    .paymentMethod(PaymentMethod.CARD)
                    .idempotencyKey("order-" + event.getOrderId())
                    .build();

            paymentService.initiatePayment(request);
            log.info("Payment initiated for order: {}", event.getOrderId());

        } catch (Exception e) {
            log.error("Failed to initiate payment for order: {}", event.getOrderId(), e);
            // Let Kafka retry or send to DLQ
            throw e;
        }
    }
}
