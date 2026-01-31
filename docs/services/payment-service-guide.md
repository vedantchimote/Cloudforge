# Payment Service Guide

Complete development guide for the Payment microservice.

---

## 📋 Service Overview

| Property | Value |
|----------|-------|
| **Port** | 8084 |
| **Database** | PostgreSQL |
| **Messaging** | Kafka (Consumer/Producer) |
| **Cache** | Redis (Idempotency) |

### Responsibilities
- Payment processing
- Idempotent payment handling
- Payment status tracking
- Refund processing
- Payment event publishing
- Integration with payment gateways (Stripe)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Service                           │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐                       │
│  │PaymentController│ │RefundController│                     │
│  └───────┬───────┘  └───────┬───────┘                       │
│          │                  │                                │
│          ▼                  ▼                                │
│  ┌─────────────────────────────────────────────────┐        │
│  │              Service Layer                       │        │
│  │ PaymentService │ RefundService │ IdempotencyService│     │
│  └─────────────────────────────────────────────────┘        │
│          │                  │                │               │
│          ▼                  ▼                ▼               │
│  ┌───────────┐       ┌───────────┐    ┌───────────┐        │
│  │PostgreSQL │       │   Kafka   │    │   Redis   │        │
│  │(Payments) │       │ (Events)  │    │(Idempotency)│       │
│  └───────────┘       └───────────┘    └───────────┘        │
│          │                                                   │
│          ▼                                                   │
│  ┌───────────────────────────────────────────────┐          │
│  │            Payment Gateway (Stripe)            │          │
│  └───────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
services/payment-service/
├── src/main/java/com/cloudforge/payment/
│   ├── PaymentServiceApplication.java
│   ├── controller/
│   │   ├── PaymentController.java
│   │   └── RefundController.java
│   ├── service/
│   │   ├── PaymentService.java
│   │   ├── RefundService.java
│   │   ├── IdempotencyService.java
│   │   └── StripeService.java
│   ├── repository/
│   │   └── PaymentRepository.java
│   ├── model/
│   │   ├── Payment.java
│   │   ├── PaymentStatus.java
│   │   └── PaymentMethod.java
│   ├── dto/
│   │   ├── PaymentRequest.java
│   │   ├── PaymentResponse.java
│   │   └── RefundRequest.java
│   ├── event/
│   │   ├── OrderCreatedEventConsumer.java
│   │   ├── PaymentCompletedEvent.java
│   │   └── EventPublisher.java
│   └── config/
│       ├── StripeConfig.java
│       └── KafkaConfig.java
└── src/main/resources/
    ├── application.yml
    └── db/migration/
        └── V1__create_payments_table.sql
```

---

## 🔧 Configuration

```yaml
# application.yml
spring:
  application:
    name: payment-service

  datasource:
    url: jdbc:postgresql://localhost:5432/cloudforge_payments
    username: ${DB_USERNAME:cloudforge}

  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: payment-service
      auto-offset-reset: earliest

stripe:
  api-key: ${STRIPE_API_KEY:sk_test_xxx}
  webhook-secret: ${STRIPE_WEBHOOK_SECRET:whsec_xxx}

server:
  port: 8084

kafka:
  topics:
    order-created: cloudforge.orders.created
    payment-completed: cloudforge.payments.completed
```

---

## 📝 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments` | Process payment | ✅ |
| GET | `/api/payments/{id}` | Get payment | ✅ |
| GET | `/api/payments/order/{orderId}` | Get by order ID | ✅ |
| POST | `/api/payments/{id}/refund` | Refund payment | ✅ ADMIN |
| POST | `/api/payments/webhook` | Stripe webhook | ❌ |

---

## 💻 Key Code

### Payment Entity
```java
@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", nullable = false, unique = true)
    private UUID orderId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 3)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;

    @Column(name = "failure_reason")
    private String failureReason;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

public enum PaymentStatus {
    PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
}
```

### Idempotent PaymentService
```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StripeService stripeService;
    private final IdempotencyService idempotencyService;
    private final EventPublisher eventPublisher;

    public PaymentResponse processPayment(PaymentRequest request) {
        String idempotencyKey = request.getIdempotencyKey();

        // 1. Check for duplicate request
        if (idempotencyService.isProcessed(idempotencyKey)) {
            log.info("Duplicate request detected: {}", idempotencyKey);
            return idempotencyService.getResult(idempotencyKey, PaymentResponse.class);
        }

        // 2. Check if payment already exists for order
        Optional<Payment> existingPayment = paymentRepository
            .findByOrderId(request.getOrderId());
        if (existingPayment.isPresent()) {
            return toResponse(existingPayment.get());
        }

        // 3. Create payment record
        Payment payment = Payment.builder()
            .orderId(request.getOrderId())
            .userId(request.getUserId())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .paymentMethod(request.getPaymentMethod())
            .idempotencyKey(idempotencyKey)
            .status(PaymentStatus.PROCESSING)
            .build();

        payment = paymentRepository.save(payment);

        try {
            // 4. Process with Stripe
            PaymentIntent intent = stripeService.createPaymentIntent(
                payment.getAmount(),
                payment.getCurrency(),
                request.getPaymentMethodId(),
                idempotencyKey
            );

            payment.setStripePaymentIntentId(intent.getId());

            if ("succeeded".equals(intent.getStatus())) {
                payment.setStatus(PaymentStatus.COMPLETED);
                
                // 5. Publish event
                eventPublisher.publishPaymentCompleted(PaymentCompletedEvent.builder()
                    .paymentId(payment.getId())
                    .orderId(payment.getOrderId())
                    .userId(payment.getUserId())
                    .status("COMPLETED")
                    .amount(payment.getAmount())
                    .completedAt(Instant.now())
                    .build());
            } else {
                payment.setStatus(PaymentStatus.PENDING);
            }

        } catch (StripeException e) {
            log.error("Payment failed: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());
        }

        Payment saved = paymentRepository.save(payment);
        PaymentResponse response = toResponse(saved);

        // 6. Store result for idempotency
        idempotencyService.markAsProcessed(idempotencyKey, response);

        return response;
    }

    public PaymentResponse refund(UUID paymentId, RefundRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new PaymentNotFoundException(paymentId));

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new RefundException("Only completed payments can be refunded");
        }

        try {
            stripeService.createRefund(
                payment.getStripePaymentIntentId(),
                request.getAmount()
            );
            payment.setStatus(PaymentStatus.REFUNDED);
        } catch (StripeException e) {
            throw new RefundException("Refund failed: " + e.getMessage());
        }

        return toResponse(paymentRepository.save(payment));
    }
}
```

### Stripe Service
```java
@Service
@Slf4j
public class StripeService {

    @Value("${stripe.api-key}")
    private String apiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = apiKey;
    }

    public PaymentIntent createPaymentIntent(
            BigDecimal amount,
            String currency,
            String paymentMethodId,
            String idempotencyKey) throws StripeException {

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amount.multiply(new BigDecimal(100)).longValue())
            .setCurrency(currency.toLowerCase())
            .setPaymentMethod(paymentMethodId)
            .setConfirm(true)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build();

        RequestOptions options = RequestOptions.builder()
            .setIdempotencyKey(idempotencyKey)
            .build();

        return PaymentIntent.create(params, options);
    }

    public Refund createRefund(String paymentIntentId, BigDecimal amount) 
            throws StripeException {
        RefundCreateParams params = RefundCreateParams.builder()
            .setPaymentIntent(paymentIntentId)
            .setAmount(amount.multiply(new BigDecimal(100)).longValue())
            .build();

        return Refund.create(params);
    }
}
```

### Kafka Consumer
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCreatedEventConsumer {

    private final PaymentService paymentService;

    @KafkaListener(topics = "${kafka.topics.order-created}")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received order created event: {}", event.getOrderId());

        // Auto-process payment for orders
        PaymentRequest request = PaymentRequest.builder()
            .orderId(event.getOrderId())
            .userId(event.getUserId())
            .amount(event.getTotalAmount())
            .idempotencyKey("order-" + event.getOrderId())
            .build();

        try {
            paymentService.processPayment(request);
        } catch (Exception e) {
            log.error("Failed to process payment for order: {}", event.getOrderId(), e);
            // Event will be retried or sent to DLQ
            throw e;
        }
    }
}
```

---

## 🗄️ Database Schema

```sql
-- V1__create_payments_table.sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_method VARCHAR(20),
    stripe_payment_intent_id VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## 📚 Related Docs

- [Java Development Guide](java-development.md)
- [Redis Caching](java-development.md#-redis-caching)
- [Security Guide](security.md)
