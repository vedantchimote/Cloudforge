# ADR 003: Use Kafka for Event Streaming

## Status
Accepted

## Context
We need asynchronous communication between services for order/payment events to notifications, with guaranteed delivery and replay capability.

## Decision
Use Apache Kafka for event-driven communication between Order, Payment, and Notification services.

## Consequences

### Positive
- Decoupled services
- Event replay capability
- High throughput
- Durable message storage
- Industry standard

### Negative
- Operational complexity
- Learning curve
- Additional infrastructure

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| RabbitMQ | Simpler, great for queues | No replay, less throughput |
| AWS SQS | Managed | Vendor lock-in |
| Redis Pub/Sub | Simple, fast | No persistence |
