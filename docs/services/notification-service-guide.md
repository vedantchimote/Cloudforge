# Notification Service Guide

Complete development guide for the Notification microservice.

---

## 📋 Service Overview

| Property | Value |
|----------|-------|
| **Port** | 8085 |
| **Database** | PostgreSQL |
| **Messaging** | Kafka (Consumer) |
| **Email** | SMTP / SendGrid |

### Responsibilities
- Email notifications
- SMS notifications (optional)
- Push notifications (optional)
- Notification templates
- Notification history
- Event-driven notifications

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Notification Service                        │
├─────────────────────────────────────────────────────────────┤
│                    Kafka Consumers                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │OrderEventConsumer││PaymentEventConsumer││UserEventConsumer│
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌─────────────────────────────────────────────────┐        │
│  │              Service Layer                       │        │
│  │ NotificationService │ EmailService │ TemplateService │   │
│  └─────────────────────────────────────────────────┘        │
│         │                │                                   │
│         ▼                ▼                                   │
│  ┌───────────┐    ┌───────────┐                             │
│  │PostgreSQL │    │ SendGrid  │                             │
│  │(History)  │    │  (Email)  │                             │
│  └───────────┘    └───────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
services/notification-service/
├── src/main/java/com/cloudforge/notification/
│   ├── NotificationServiceApplication.java
│   ├── consumer/
│   │   ├── OrderEventConsumer.java
│   │   ├── PaymentEventConsumer.java
│   │   └── UserEventConsumer.java
│   ├── service/
│   │   ├── NotificationService.java
│   │   ├── EmailService.java
│   │   ├── TemplateService.java
│   │   └── SmsService.java
│   ├── repository/
│   │   └── NotificationRepository.java
│   ├── model/
│   │   ├── Notification.java
│   │   ├── NotificationType.java
│   │   └── NotificationStatus.java
│   ├── template/
│   │   └── EmailTemplates.java
│   └── config/
│       ├── KafkaConfig.java
│       └── MailConfig.java
└── src/main/resources/
    ├── application.yml
    ├── templates/
    │   ├── order-confirmation.html
    │   ├── payment-receipt.html
    │   └── welcome.html
    └── db/migration/
        └── V1__create_notifications_table.sql
```

---

## 🔧 Configuration

```yaml
# application.yml
spring:
  application:
    name: notification-service

  datasource:
    url: jdbc:postgresql://localhost:5432/cloudforge_notifications
    username: ${DB_USERNAME:cloudforge}

  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: notification-service
      auto-offset-reset: earliest

  mail:
    host: smtp.sendgrid.net
    port: 587
    username: apikey
    password: ${SENDGRID_API_KEY}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

  thymeleaf:
    prefix: classpath:/templates/
    suffix: .html

server:
  port: 8085

notification:
  from-email: noreply@cloudforge.io
  from-name: CloudForge
```

---

## 📝 Notification Types

| Type | Trigger Event | Template |
|------|---------------|----------|
| `ORDER_CONFIRMATION` | order.created | order-confirmation.html |
| `PAYMENT_SUCCESS` | payment.completed | payment-receipt.html |
| `PAYMENT_FAILED` | payment.failed | payment-failed.html |
| `ORDER_SHIPPED` | order.shipped | order-shipped.html |
| `WELCOME` | user.registered | welcome.html |

---

## 💻 Key Code

### Notification Entity
```java
@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String recipient;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "sent_at")
    private Instant sentAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;
}

public enum NotificationType {
    ORDER_CONFIRMATION, PAYMENT_SUCCESS, PAYMENT_FAILED,
    ORDER_SHIPPED, ORDER_DELIVERED, WELCOME
}

public enum NotificationStatus {
    PENDING, SENT, FAILED
}
```

### Kafka Consumers
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "${kafka.topics.order-created}")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Processing order confirmation for: {}", event.getOrderId());
        
        notificationService.sendOrderConfirmation(
            event.getUserId(),
            event.getOrderId(),
            event.getTotalAmount(),
            event.getItems()
        );
    }

    @KafkaListener(topics = "${kafka.topics.order-shipped}")
    public void handleOrderShipped(OrderShippedEvent event) {
        log.info("Processing shipping notification for: {}", event.getOrderId());
        
        notificationService.sendShippingNotification(
            event.getUserId(),
            event.getOrderId(),
            event.getTrackingNumber()
        );
    }
}

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "${kafka.topics.payment-completed}")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("Processing payment receipt for: {}", event.getPaymentId());
        
        if ("COMPLETED".equals(event.getStatus())) {
            notificationService.sendPaymentReceipt(
                event.getUserId(),
                event.getPaymentId(),
                event.getAmount()
            );
        } else if ("FAILED".equals(event.getStatus())) {
            notificationService.sendPaymentFailure(
                event.getUserId(),
                event.getOrderId(),
                event.getFailureReason()
            );
        }
    }
}
```

### Notification Service
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final TemplateService templateService;
    private final UserClient userClient;

    @Async
    public void sendOrderConfirmation(
            UUID userId, UUID orderId, BigDecimal amount, List<OrderItem> items) {
        
        UserResponse user = userClient.getUser(userId);
        
        Map<String, Object> variables = Map.of(
            "userName", user.getFirstName(),
            "orderId", orderId.toString(),
            "amount", amount,
            "items", items
        );

        String content = templateService.render("order-confirmation", variables);
        
        Notification notification = Notification.builder()
            .userId(userId)
            .recipient(user.getEmail())
            .type(NotificationType.ORDER_CONFIRMATION)
            .subject("Order Confirmation - " + orderId)
            .content(content)
            .referenceId(orderId.toString())
            .build();

        sendEmail(notification);
    }

    @Async
    public void sendPaymentReceipt(UUID userId, UUID paymentId, BigDecimal amount) {
        UserResponse user = userClient.getUser(userId);
        
        Map<String, Object> variables = Map.of(
            "userName", user.getFirstName(),
            "paymentId", paymentId.toString(),
            "amount", amount,
            "date", LocalDateTime.now()
        );

        String content = templateService.render("payment-receipt", variables);
        
        Notification notification = Notification.builder()
            .userId(userId)
            .recipient(user.getEmail())
            .type(NotificationType.PAYMENT_SUCCESS)
            .subject("Payment Receipt - " + paymentId)
            .content(content)
            .referenceId(paymentId.toString())
            .build();

        sendEmail(notification);
    }

    @Async
    public void sendWelcomeEmail(UUID userId, String email, String firstName) {
        Map<String, Object> variables = Map.of(
            "userName", firstName
        );

        String content = templateService.render("welcome", variables);
        
        Notification notification = Notification.builder()
            .userId(userId)
            .recipient(email)
            .type(NotificationType.WELCOME)
            .subject("Welcome to CloudForge!")
            .content(content)
            .build();

        sendEmail(notification);
    }

    private void sendEmail(Notification notification) {
        notification = notificationRepository.save(notification);
        
        try {
            emailService.send(
                notification.getRecipient(),
                notification.getSubject(),
                notification.getContent()
            );
            
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(Instant.now());
            log.info("Email sent successfully to: {}", notification.getRecipient());
            
        } catch (Exception e) {
            log.error("Failed to send email", e);
            notification.setStatus(NotificationStatus.FAILED);
            notification.setFailureReason(e.getMessage());
        }
        
        notificationRepository.save(notification);
    }
}
```

### Email Service
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${notification.from-email}")
    private String fromEmail;

    @Value("${notification.from-name}")
    private String fromName;

    public void send(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromEmail, fromName));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent to: {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
            throw new EmailSendException("Failed to send email", e);
        }
    }
}
```

### Template Service
```java
@Service
@RequiredArgsConstructor
public class TemplateService {

    private final SpringTemplateEngine templateEngine;

    public String render(String templateName, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        return templateEngine.process(templateName, context);
    }
}
```

### Email Template Example
```html
<!-- templates/order-confirmation.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #4f46e5; color: white; padding: 20px; }
        .content { padding: 20px; }
        .order-details { background: #f5f5f5; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; color: #666; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
        </div>
        <div class="content">
            <p>Hi <span th:text="${userName}">Customer</span>,</p>
            <p>Thank you for your order! Here are your order details:</p>
            
            <div class="order-details">
                <p><strong>Order ID:</strong> <span th:text="${orderId}"></span></p>
                <p><strong>Total:</strong> $<span th:text="${amount}"></span></p>
            </div>

            <h3>Items:</h3>
            <ul>
                <li th:each="item : ${items}">
                    <span th:text="${item.name}"></span> x 
                    <span th:text="${item.quantity}"></span>
                </li>
            </ul>
        </div>
        <div class="footer">
            <p>CloudForge - Where cloud-native applications are forged</p>
        </div>
    </div>
</body>
</html>
```

---

## 🗄️ Database Schema

```sql
-- V1__create_notifications_table.sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    reference_id VARCHAR(100),
    failure_reason TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
```

---

## 📚 Related Docs

- [Java Development Guide](java-development.md)
- [Kafka Integration](java-development.md#-kafka-integration)
- [Monitoring](monitoring.md)
