---
title: 'Order Service'
description: 'Order management and processing microservice'
---

## Overview

The Order Service handles the core e-commerce functionality of placing, tracking, and managing orders. It integrates with the Product Service for inventory checks and the User Service for customer validation.

<CardGroup cols={2}>
  <Card title="Port 8083" icon="server">
    Runs on port 8083 by default
  </Card>
  <Card title="PostgreSQL" icon="database">
    Uses `cloudforge_orders` database
  </Card>
  <Card title="Kafka" icon="tower-broadcast">
    Publishes order events
  </Card>
  <Card title="Redis" icon="layer-group">
    Caches cart data
  </Card>
</CardGroup>

## Architecture

The Order Service sits at the center of the checkout flow, orchestrating interactions between the user, inventory, and payment systems (planned).

```mermaid
graph TD
    User[Clients] -->|REST API| OrderService
    OrderService -->|Feign Client| ProductService[Product Service]
    OrderService -->|Feign Client| UserService[User Service]
    OrderService -->|Events| Kafka{Kafka}
    OrderService -->|Persist| DB[(PostgreSQL)]
    OrderService -->|Cache| Cache[(Redis)]
    
    subgraph "Order Service Internals"
        CartController --> CartService
        OrderController --> OrderServiceLogic
    end
```

## Class Diagram

```mermaid
classDiagram
    class Order {
        +UUID id
        +UUID userId
        +OrderStatus status
        +BigDecimal totalAmount
        +List~OrderItem~ items
        +String shippingAddress
    }

    class OrderItem {
        +String productId
        +String productName
        +int quantity
        +BigDecimal unitPrice
    }

    class Cart {
        +UUID userId
        +List~CartItem~ items
        +BigDecimal total
    }

    class OrderService {
        +createOrder(OrderRequest)
        +getUserOrders(UUID, Pageable)
        +cancelOrder(UUID)
    }

    class CartService {
        +getCart(UUID)
        +addToCart(UUID, CartItemRequest)
        +removeItem(UUID, String)
        +checkout(UUID)
    }

    class OrderController {
        +createOrder(OrderRequest)
        +getOrders(int, int)
    }

    OrderController --> OrderService
    OrderService --> OrderRepository
    OrderService --> ProductClient
    OrderService --> UserClient
    OrderService --> EventPublisher
    Order "1" *-- "*" OrderItem : contains
```

## Deployment

```mermaid
graph TB
    subgraph Docker Host
        subgraph "Order Service Network"
            Container[Order Service Container]
            DB[(PostgreSQL Container)]
            Redis[(Redis Container)]
            Kafka{Kafka Broker}
        end
        HostPort[Port 8083]
    end

    HostPort -->|Forward| Container
    Container -->|JDBC:5432| DB
    Container -->|RESP| Redis
    Container -->|TCP:29092| Kafka
```

## Order Status Flow

Orders transition through specific states during their lifecycle.

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> CONFIRMED: Payment Success
    PENDING --> CANCELLED: Payment Failed / User Cancel
    CONFIRMED --> PROCESSING: Warehouse Pick
    PROCESSING --> SHIPPED: Carrier Pickup
    SHIPPED --> DELIVERED: Customer Receipt
    CANCELLED --> [*]
    DELIVERED --> [*]
```

## Database Schema

The service uses a relational schema to manage orders and line items.

```mermaid
erDiagram
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        uuid id PK
        uuid user_id
        string status
        decimal total_amount
        string shipping_address
        timestamp created_at
    }
    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        string product_id
        int quantity
        decimal unit_price
        decimal total_price
    }
```

## API Reference

### Authentication

All order and cart endpoints require JWT authentication. The API Gateway validates the token and adds the `X-User-Id` header before forwarding requests to the Order Service.

**Required Header:**
```http
Authorization: Bearer <jwt_token>
```

**Automatic Header (added by API Gateway):**
```http
X-User-Id: <user-uuid>
```

### Cart Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cart` | Retrieve current user's cart |
| `POST` | `/api/cart/items` | Add item to cart |
| `PUT` | `/api/cart/items/{productId}` | Update item quantity |
| `DELETE` | `/api/cart/items/{productId}` | Remove item from cart |
| `POST` | `/api/cart/checkout` | Convert cart to order |

### Order Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders` | Create a new order directly |
| `GET` | `/api/orders/user/{userId}` | List user's orders |
| `GET` | `/api/orders/{id}` | Get order details |
| `PUT` | `/api/orders/{id}/cancel` | Cancel an order |

### Create Order Request Format

**Endpoint:** `POST /api/orders`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St, Apt 4B",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingZip": "400001",
  "shippingCountry": "India",
  "notes": "John Doe | +91 9876543210"
}
```

**Note:** The `userId` is automatically extracted from the JWT token by the API Gateway. Do not include it in the request body.

**Response:**
```json
{
  "id": "order-uuid",
  "userId": "user-uuid",
  "status": "PENDING",
  "totalAmount": 299.98,
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "price": 149.99
    }
  ],
  "shippingAddress": "123 Main St, Apt 4B",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingZip": "400001",
  "shippingCountry": "India",
  "notes": "John Doe | +91 9876543210",
  "createdAt": "2026-04-19T10:30:00Z"
}
```

## Configuration

The service is configured via `application.yml`. Key settings include:

```yaml
server:
  port: 8083

spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/cloudforge_orders
  kafka:
    bootstrap-servers: kafka:29092
  data:
    redis:
      host: redis
      port: 6379
```

## Development

To run the service locally:

```bash
cd services/order-service
mvn spring-boot:run
```

Ensure infrastructure is up:

```bash
docker-compose up -d postgres redis kafka zookeeper
```
