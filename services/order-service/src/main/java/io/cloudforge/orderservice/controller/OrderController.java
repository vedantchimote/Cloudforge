package io.cloudforge.orderservice.controller;

import io.cloudforge.orderservice.dto.OrderRequest;
import io.cloudforge.orderservice.dto.OrderResponse;
import io.cloudforge.orderservice.model.OrderStatus;
import io.cloudforge.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management")
public class OrderController {

    private final OrderService orderService;

    // TODO: Get userId from JWT token in production
    private UUID getUserId(String userIdHeader) {
        return UUID.fromString(userIdHeader);
    }

    @PostMapping
    @Operation(summary = "Create a new order")
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse order = orderService.createOrder(getUserId(userId), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<OrderResponse> getOrder(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getOrderForUser(orderId, getUserId(userId)));
    }

    @GetMapping
    @Operation(summary = "Get user's orders")
    public ResponseEntity<Page<OrderResponse>> getUserOrders(
            @RequestHeader("X-User-Id") String userId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(orderService.getUserOrders(getUserId(userId), pageable));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get orders by status (Admin)")
    public ResponseEntity<Page<OrderResponse>> getOrdersByStatus(
            @PathVariable OrderStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status, pageable));
    }

    @PutMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel an order")
    public ResponseEntity<OrderResponse> cancelOrder(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID orderId,
            @RequestParam(required = false, defaultValue = "Cancelled by user") String reason) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, getUserId(userId), reason));
    }

    @PutMapping("/{orderId}/status")
    @Operation(summary = "Update order status (Admin)")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
}
