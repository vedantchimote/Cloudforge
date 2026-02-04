package io.cloudforge.orderservice.event;

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

    @Value("${kafka.topics.order-created}")
    private String orderCreatedTopic;

    @Value("${kafka.topics.order-cancelled}")
    private String orderCancelledTopic;

    public void publishOrderCreated(OrderCreatedEvent event) {
        log.info("Publishing order created event for order: {}", event.getOrderId());
        kafkaTemplate.send(orderCreatedTopic, event.getOrderId().toString(), event);
    }

    public void publishOrderCancelled(OrderCancelledEvent event) {
        log.info("Publishing order cancelled event for order: {}", event.getOrderId());
        kafkaTemplate.send(orderCancelledTopic, event.getOrderId().toString(), event);
    }
}
