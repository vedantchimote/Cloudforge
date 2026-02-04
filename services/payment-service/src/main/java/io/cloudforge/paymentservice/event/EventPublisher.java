package io.cloudforge.paymentservice.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.payment-completed}")
    private String paymentCompletedTopic;

    @Value("${kafka.topics.payment-failed}")
    private String paymentFailedTopic;

    public void publishPaymentCompleted(PaymentCompletedEvent event) {
        log.info("Publishing payment completed event for order: {}", event.getOrderId());
        kafkaTemplate.send(paymentCompletedTopic, event.getOrderId().toString(), event);
    }

    public void publishPaymentFailed(PaymentFailedEvent event) {
        log.info("Publishing payment failed event for order: {}", event.getOrderId());
        kafkaTemplate.send(paymentFailedTopic, event.getOrderId().toString(), event);
    }
}
