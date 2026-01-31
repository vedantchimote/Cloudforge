# ADR 002: Use MongoDB for Product Catalog

## Status
Accepted

## Context
Product data has flexible schemas (varying attributes per category), requires fast read performance, and benefits from document-based modeling.

## Decision
Use MongoDB for the Product Service while keeping PostgreSQL for transactional services (User, Order, Payment).

## Consequences

### Positive
- Flexible schema for product attributes
- Fast read performance
- Easy horizontal scaling
- Rich querying on nested data
- Demonstrates polyglot persistence

### Negative
- Another database to manage
- No ACID transactions with other services
- Team needs MongoDB expertise

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| PostgreSQL JSONB | Single DB, ACID | Less flexible, slower queries |
| Elasticsearch | Great search | Not a primary database |
| DynamoDB | Managed, scalable | Vendor lock-in |
