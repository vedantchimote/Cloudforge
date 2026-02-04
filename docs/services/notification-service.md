---
title: 'Notification Service'
description: 'Multi-channel notification microservice with email templates'
---

## Overview

The Notification Service handles multi-channel notifications (Email, SMS, Push) with templated content, retry logic, and event-driven architecture.

<CardGroup cols={2}>
  <Card title="Port 8085" icon="server">
    Runs on port 8085 by default
  </Card>
  <Card title="PostgreSQL" icon="database">
    Uses `cloudforge_notifications` database
  </Card>
  <Card title="SMTP" icon="envelope">
    Email via JavaMail + Thymeleaf
  </Card>
  <Card title="Kafka" icon="tower-broadcast">
    Event-driven notifications
  </Card>
</CardGroup>

## Architecture

The Notification Service consumes events from Order and Payment services to send notifications.

```mermaid
graph TD
    OrderService -->|Kafka: order-created| NotificationService
    PaymentService -->|Kafka: payment-completed| NotificationService
    PaymentService -->|Kafka: payment-failed| NotificationService
    
    NotificationService -->|SMTP| EmailServer[Email Server]
    NotificationService -->|Store| DB[(PostgreSQL)]
    
    subgraph "Notification Service"
        EventConsumer -->|Process| NotificationServiceLogic
        NotificationController -->|API| NotificationServiceLogic
        NotificationServiceLogic -->|Render| TemplateService
        NotificationServiceLogic -->|Send| EmailService
    end
```

## Class Diagram

```mermaid
classDiagram
    class Notification {
        +UUID id
        +UUID userId
        +NotificationType type
        +NotificationChannel channel
        +String recipient
        +NotificationStatus status
        +int retryCount
    }

    class NotificationRepository {
        +findByStatus(NotificationStatus)
        +findByUserId(UUID)
    }

    class EmailService {
        +sendEmail(String, String, String)
        +sendEmailAsync(String, String, String)
    }

    class TemplateService {
        +renderTemplate(String, Map)
        +getSubjectForType(String)
    }

    class NotificationService {
        +sendNotification(NotificationRequest)
        +retryFailedNotifications()
        +sendWelcomeEmail(UUID, String)
    }

    class EventConsumer {
        +handleOrderCreated(OrderCreatedEvent)
        +handlePaymentCompleted(PaymentCompletedEvent)
    }

    EventConsumer --> NotificationService
    NotificationService --> NotificationRepository
    NotificationService --> EmailService
    NotificationService --> TemplateService
    NotificationService ..> Notification : Manages
```

## Deployment

```mermaid
graph TB
    subgraph Docker Host
        subgraph "Notification Service Network"
            Container[Notification Service Container]
            DB[(PostgreSQL Container)]
            Kafka{Kafka Broker}
            SMTP[SMTP Server]
        end
        HostPort[Port 8085]
    end

    HostPort -->|Forward| Container
    Container -->|JDBC:5432| DB
    Container -->|TCP:29092| Kafka
    Container -->|SMTP:587| SMTP
```

## Notification Flow

```mermaid
sequenceDiagram
    participant K as Kafka
    participant N as Notification Service
    participant T as Template Service
    participant E as Email Service
    participant S as SMTP Server

    K->>N: Event (order-created)
    N->>T: Get template + render
    T-->>N: HTML content
    N->>E: Send email
    E->>S: SMTP send
    S-->>E: Success/Failure
    E-->>N: Result
    N->>N: Update status (SENT/FAILED)
    
    alt Failure
        N->>N: Schedule retry
    end
```

## Database Schema

```mermaid
erDiagram
    NOTIFICATION {
        uuid id PK
        uuid user_id
        string type
        string channel
        string subject
        text content
        string recipient
        string status
        string reference_id
        string reference_type
        int retry_count
        string error_message
        timestamp sent_at
        timestamp created_at
    }
```

## Email Templates

| Template | Type | Description |
| :--- | :--- | :--- |
| `order-confirmation` | ORDER_CONFIRMATION | Order placed successfully |
| `payment-success` | PAYMENT_SUCCESS | Payment completed |
| `payment-failed` | PAYMENT_FAILED | Payment failed with retry link |
| `welcome` | WELCOME | New user registration |

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/notifications` | Send notification |
| `GET` | `/api/notifications/{id}` | Get notification by ID |
| `GET` | `/api/notifications/user/{userId}` | Get user's notifications |
| `POST` | `/api/notifications/welcome` | Send welcome email (test) |

## Configuration

```yaml
server:
  port: 8085

spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}

notification:
  from-email: noreply@cloudforgetech.in
  from-name: CloudForge
  retry-attempts: 3
```

## Development

```bash
cd services/notification-service
mvn spring-boot:run

# Swagger UI
http://localhost:8085/swagger-ui.html
```
