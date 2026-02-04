---
title: 'Payment Service'
description: 'Payment processing microservice with Razorpay integration'
---

## Overview

The Payment Service handles payment processing for orders using Razorpay as the payment gateway. It provides idempotent payment handling, refund processing, and event-driven communication.

<CardGroup cols={2}>
  <Card title="Port 8084" icon="server">
    Runs on port 8084 by default
  </Card>
  <Card title="PostgreSQL" icon="database">
    Uses `cloudforge_payments` database
  </Card>
  <Card title="Razorpay" icon="credit-card">
    Payment gateway integration
  </Card>
  <Card title="Redis" icon="layer-group">
    Idempotency key storage
  </Card>
</CardGroup>

## Architecture

The Payment Service consumes order events and processes payments through Razorpay.

```mermaid
graph TD
    Frontend[React Frontend] -->|POST /payments| PaymentService
    OrderService -->|Kafka: order-created| PaymentService
    PaymentService -->|API| Razorpay[Razorpay Gateway]
    PaymentService -->|Idempotency| Redis[(Redis)]
    PaymentService -->|Persist| DB[(PostgreSQL)]
    PaymentService -->|Kafka: payment-completed| NotificationService
    
    subgraph "Payment Service"
        PaymentController --> PaymentServiceLogic
        OrderCreatedConsumer --> PaymentServiceLogic
        PaymentServiceLogic --> RazorpayService
        PaymentServiceLogic --> IdempotencyService
    end
```

## Class Diagram

```mermaid
classDiagram
    class Payment {
        +UUID id
        +UUID orderId
        +BigDecimal amount
        +String currency
        +PaymentStatus status
        +String razorpayOrderId
        +String razorpayPaymentId
    }

    class PaymentRepository {
        +Optional~Payment~ findByOrderId(UUID)
        +Optional~Payment~ findByRazorpayOrderId(String)
    }

    class RazorpayService {
        +createOrder(BigDecimal, String, String)
        +verifySignature(String, String, String)
        +fetchPayment(String)
    }

    class IdempotencyService {
        +boolean isDuplicate(String, String)
        +void markProcessed(String, String)
    }

    class PaymentService {
        +initiatePayment(PaymentRequest)
        +verifyPayment(PaymentVerificationRequest)
        +processRefund(UUID)
    }

    class PaymentController {
        +initiate(PaymentRequest)
        +verify(PaymentVerificationRequest)
    }

    PaymentController --> PaymentService
    PaymentService --> RazorpayService
    PaymentService --> IdempotencyService
    PaymentService --> PaymentRepository
    PaymentService --> EventPublisher
```

## Deployment

```mermaid
graph TB
    subgraph Docker Host
        subgraph "Payment Service Network"
            Container[Payment Service Container]
            DB[(PostgreSQL Container)]
            Redis[(Redis Container)]
            Kafka{Kafka Broker}
            Razorpay[Razorpay API]
        end
        HostPort[Port 8084]
    end

    HostPort -->|Forward| Container
    Container -->|JDBC:5432| DB
    Container -->|RESP| Redis
    Container -->|TCP:29092| Kafka
    Container -->|HTTPS| Razorpay
```

## Payment Flow

The payment process involves frontend integration with Razorpay checkout.

```mermaid
sequenceDiagram
    participant F as Frontend
    participant P as Payment Service
    participant R as Razorpay
    participant K as Kafka

    F->>P: POST /api/payments (initiate)
    P->>R: Create Razorpay Order
    R-->>P: Order ID + Key ID
    P-->>F: razorpayOrderId, razorpayKeyId
    
    F->>R: Open Razorpay Checkout
    R-->>F: Payment ID + Signature
    
    F->>P: POST /api/payments/verify
    P->>P: Verify Signature
    P->>K: Publish payment-completed
    P-->>F: Payment Confirmed
```

## Database Schema

```mermaid
erDiagram
    PAYMENT {
        uuid id PK
        uuid order_id UK
        uuid user_id
        decimal amount
        string currency
        string status
        string payment_method
        string razorpay_order_id
        string razorpay_payment_id
        string razorpay_signature
        string idempotency_key UK
        string failure_reason
        decimal refunded_amount
        timestamp created_at
    }
```

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/payments` | Initiate payment (create Razorpay order) |
| `POST` | `/api/payments/verify` | Verify payment after checkout |
| `GET` | `/api/payments/{id}` | Get payment by ID |
| `GET` | `/api/payments/order/{orderId}` | Get payment by order |
| `POST` | `/api/payments/{id}/refund` | Process refund |

## Configuration

```yaml
server:
  port: 8084

razorpay:
  key-id: ${RAZORPAY_KEY_ID}
  key-secret: ${RAZORPAY_KEY_SECRET}

spring:
  kafka:
    consumer:
      group-id: payment-service
```

## Development

```bash
cd services/payment-service
mvn spring-boot:run

# Swagger UI
http://localhost:8084/swagger-ui.html
```
