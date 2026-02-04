package io.cloudforge.orderservice.service;

import io.cloudforge.orderservice.client.ProductClient;
import io.cloudforge.orderservice.client.ProductResponse;
import io.cloudforge.orderservice.client.StockRequest;
import io.cloudforge.orderservice.dto.*;
import io.cloudforge.orderservice.event.EventPublisher;
import io.cloudforge.orderservice.event.OrderCreatedEvent;
import io.cloudforge.orderservice.event.OrderCancelledEvent;
import io.cloudforge.orderservice.event.OrderItemEvent;
import io.cloudforge.orderservice.exception.CartEmptyException;
import io.cloudforge.orderservice.exception.OrderCreationException;
import io.cloudforge.orderservice.exception.OrderNotFoundException;
import io.cloudforge.orderservice.model.*;
import io.cloudforge.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductClient productClient;
    private final EventPublisher eventPublisher;

    public OrderResponse createOrder(UUID userId, OrderRequest request) {
        log.info("Creating order for user: {}", userId);

        // Validate and get products
        List<ProductResponse> products = request.getItems().stream()
                .map(item -> productClient.getProduct(item.getProductId()))
                .toList();

        // Create order
        Order order = Order.builder()
                .userId(userId)
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingState(request.getShippingState())
                .shippingZip(request.getShippingZip())
                .shippingCountry(request.getShippingCountry())
                .notes(request.getNotes())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        // Add items
        for (int i = 0; i < request.getItems().size(); i++) {
            OrderItemRequest itemRequest = request.getItems().get(i);
            ProductResponse product = products.get(i);

            OrderItem orderItem = OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
            orderItem.calculateTotalPrice();
            order.addItem(orderItem);
        }

        order.calculateTotal();
        Order saved = orderRepository.save(order);

        // Publish event
        publishOrderCreatedEvent(saved);

        log.info("Order created successfully: {}", saved.getId());
        return OrderResponse.fromOrder(saved);
    }

    public OrderResponse checkoutCart(UUID userId, CheckoutRequest request) {
        log.info("Checking out cart for user: {}", userId);

        Cart cart = cartService.getCartEntity(userId);

        if (cart.getItems().isEmpty()) {
            throw new CartEmptyException();
        }

        // Create order from cart
        Order order = Order.builder()
                .userId(userId)
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingState(request.getShippingState())
                .shippingZip(request.getShippingZip())
                .shippingCountry(request.getShippingCountry())
                .notes(request.getNotes())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        // Convert cart items to order items
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .productId(cartItem.getProductId())
                    .productName(cartItem.getProductName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .build();
            orderItem.calculateTotalPrice();
            order.addItem(orderItem);
        }

        order.calculateTotal();
        Order saved = orderRepository.save(order);

        // Clear the cart
        cartService.clearCart(userId);

        // Publish event
        publishOrderCreatedEvent(saved);

        log.info("Checkout completed. Order ID: {}", saved.getId());
        return OrderResponse.fromOrder(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        return OrderResponse.fromOrder(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderForUser(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        return OrderResponse.fromOrder(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(UUID userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(OrderResponse::fromOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable)
                .map(OrderResponse::fromOrder);
    }

    public OrderResponse cancelOrder(UUID orderId, UUID userId, String reason) {
        log.info("Cancelling order {} for user {}", orderId, userId);

        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (!order.getStatus().isCancellable()) {
            throw new OrderCreationException("Order cannot be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        // Publish cancellation event
        eventPublisher.publishOrderCancelled(OrderCancelledEvent.builder()
                .orderId(order.getId())
                .userId(userId)
                .reason(reason)
                .cancelledAt(Instant.now())
                .build());

        log.info("Order {} cancelled successfully", orderId);
        return OrderResponse.fromOrder(saved);
    }

    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        log.info("Updating order {} status to {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);

        return OrderResponse.fromOrder(saved);
    }

    private void publishOrderCreatedEvent(Order order) {
        List<OrderItemEvent> itemEvents = order.getItems().stream()
                .map(item -> OrderItemEvent.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .toList();

        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .items(itemEvents)
                .createdAt(Instant.now())
                .build();

        eventPublisher.publishOrderCreated(event);
    }
}
