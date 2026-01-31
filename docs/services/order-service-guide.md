# Order Service Guide

Complete development guide for the Order microservice.

---

## 📋 Service Overview

| Property | Value |
|----------|-------|
| **Port** | 8083 |
| **Database** | PostgreSQL |
| **Messaging** | Kafka (Producer) |
| **Dependencies** | User Service, Product Service |

### Responsibilities
- Order creation and management
- Cart management
- Order status tracking
- Inventory reservation
- Order history
- Publishing order events

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Order Service                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │OrderController│ │CartController│ │StatusController│       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌─────────────────────────────────────────────────┐        │
│  │              Service Layer                       │        │
│  │  OrderService │ CartService │ InventoryService   │        │
│  └─────────────────────────────────────────────────┘        │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐           │
│  │PostgreSQL │    │   Redis   │    │   Kafka   │           │
│  │ (Orders)  │    │  (Cart)   │    │  (Events) │           │
│  └───────────┘    └───────────┘    └───────────┘           │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────┐        │
│  │           External Services (Feign)              │        │
│  │    UserClient  │  ProductClient                  │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
services/order-service/
├── src/main/java/com/cloudforge/order/
│   ├── OrderServiceApplication.java
│   ├── controller/
│   │   ├── OrderController.java
│   │   ├── CartController.java
│   │   └── OrderStatusController.java
│   ├── service/
│   │   ├── OrderService.java
│   │   ├── CartService.java
│   │   └── InventoryService.java
│   ├── repository/
│   │   ├── OrderRepository.java
│   │   └── OrderItemRepository.java
│   ├── model/
│   │   ├── Order.java
│   │   ├── OrderItem.java
│   │   ├── OrderStatus.java
│   │   └── Cart.java
│   ├── dto/
│   │   ├── OrderRequest.java
│   │   ├── OrderResponse.java
│   │   ├── CartItemRequest.java
│   │   └── CartResponse.java
│   ├── client/
│   │   ├── UserClient.java
│   │   └── ProductClient.java
│   ├── event/
│   │   ├── OrderCreatedEvent.java
│   │   └── EventPublisher.java
│   └── config/
│       ├── FeignConfig.java
│       └── KafkaConfig.java
└── src/main/resources/
    ├── application.yml
    └── db/migration/
        ├── V1__create_orders_table.sql
        └── V2__create_order_items_table.sql
```

---

## 🔧 Configuration

```yaml
# application.yml
spring:
  application:
    name: order-service

  datasource:
    url: jdbc:postgresql://localhost:5432/cloudforge_orders
    username: ${DB_USERNAME:cloudforge}

  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 5000

server:
  port: 8083

services:
  user-service-url: http://localhost:8081
  product-service-url: http://localhost:8082
```

---

## 📝 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order | ✅ |
| GET | `/api/orders/{id}` | Get order | ✅ |
| GET | `/api/orders` | Get user orders | ✅ |
| PUT | `/api/orders/{id}/cancel` | Cancel order | ✅ |
| POST | `/api/cart/items` | Add to cart | ✅ |
| GET | `/api/cart` | Get cart | ✅ |
| DELETE | `/api/cart/items/{id}` | Remove from cart | ✅ |
| POST | `/api/cart/checkout` | Checkout cart | ✅ |

---

## 💻 Key Code

### Order Entity
```java
@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "shipping_address")
    private String shippingAddress;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

public enum OrderStatus {
    PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
}
```

### OrderService with Saga Pattern
```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final EventPublisher eventPublisher;

    public OrderResponse createOrder(UUID userId, OrderRequest request) {
        log.info("Creating order for user: {}", userId);

        // 1. Validate products exist and have stock
        List<ProductResponse> products = validateAndGetProducts(request.getItems());

        // 2. Calculate total
        BigDecimal total = calculateTotal(products, request.getItems());

        // 3. Create order
        Order order = Order.builder()
            .userId(userId)
            .totalAmount(total)
            .shippingAddress(request.getShippingAddress())
            .status(OrderStatus.PENDING)
            .build();

        // 4. Add items
        request.getItems().forEach(item -> {
            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .productId(item.getProductId())
                .quantity(item.getQuantity())
                .price(findProduct(products, item.getProductId()).getPrice())
                .build();
            order.getItems().add(orderItem);
        });

        Order saved = orderRepository.save(order);

        // 5. Reserve inventory
        try {
            reserveInventory(saved);
        } catch (Exception e) {
            log.error("Failed to reserve inventory", e);
            saved.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(saved);
            throw new OrderCreationException("Inventory reservation failed");
        }

        // 6. Publish event
        eventPublisher.publishOrderCreated(OrderCreatedEvent.builder()
            .orderId(saved.getId())
            .userId(userId)
            .totalAmount(total)
            .items(toEventItems(saved.getItems()))
            .createdAt(Instant.now())
            .build());

        return toResponse(saved);
    }

    public OrderResponse cancelOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (!order.getUserId().equals(userId)) {
            throw new AccessDeniedException("Cannot cancel order");
        }

        if (!order.getStatus().isCancellable()) {
            throw new OrderCancellationException("Order cannot be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        
        // Release inventory
        releaseInventory(order);

        return toResponse(orderRepository.save(order));
    }
}
```

### Feign Client
```java
@FeignClient(name = "product-service", url = "${services.product-service-url}")
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ProductResponse getProduct(@PathVariable String id);

    @PostMapping("/api/products/{id}/reserve")
    void reserveStock(@PathVariable String id, @RequestBody StockRequest request);

    @PostMapping("/api/products/{id}/release")
    void releaseStock(@PathVariable String id, @RequestBody StockRequest request);
}
```

### Cart Service (Redis)
```java
@Service
@RequiredArgsConstructor
public class CartService {

    private final RedisTemplate<String, Cart> redisTemplate;
    private static final String CART_PREFIX = "cart:";
    private static final long CART_TTL_DAYS = 7;

    public Cart getCart(UUID userId) {
        String key = CART_PREFIX + userId;
        Cart cart = redisTemplate.opsForValue().get(key);
        return cart != null ? cart : new Cart(userId);
    }

    public Cart addItem(UUID userId, CartItemRequest request) {
        Cart cart = getCart(userId);
        cart.addItem(new CartItem(
            request.getProductId(),
            request.getQuantity()
        ));
        saveCart(userId, cart);
        return cart;
    }

    public void clearCart(UUID userId) {
        redisTemplate.delete(CART_PREFIX + userId);
    }

    private void saveCart(UUID userId, Cart cart) {
        String key = CART_PREFIX + userId;
        redisTemplate.opsForValue().set(key, cart, CART_TTL_DAYS, TimeUnit.DAYS);
    }
}
```

---

## 🗄️ Database Schema

```sql
-- V1__create_orders_table.sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- V2__create_order_items_table.sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

---

## 📚 Related Docs

- [Java Development Guide](java-development.md)
- [Kafka Integration](java-development.md#-kafka-integration)
- [API Reference](api-reference.md)
