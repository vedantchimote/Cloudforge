package io.cloudforge.orderservice.controller;

import io.cloudforge.orderservice.dto.CartItemRequest;
import io.cloudforge.orderservice.dto.CartResponse;
import io.cloudforge.orderservice.dto.CheckoutRequest;
import io.cloudforge.orderservice.dto.OrderResponse;
import io.cloudforge.orderservice.service.CartService;
import io.cloudforge.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart management")
public class CartController {

    private final CartService cartService;
    private final OrderService orderService;

    // TODO: Get userId from JWT token in production
    // For now, accept as header for testing
    private UUID getUserId(String userIdHeader) {
        return UUID.fromString(userIdHeader);
    }

    @GetMapping
    @Operation(summary = "Get user's cart")
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(cartService.getCart(getUserId(userId)));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<CartResponse> addItem(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(getUserId(userId), request));
    }

    @PutMapping("/items/{productId}")
    @Operation(summary = "Update item quantity in cart")
    public ResponseEntity<CartResponse> updateItemQuantity(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(cartService.updateItemQuantity(getUserId(userId), productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<CartResponse> removeItem(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String productId) {
        return ResponseEntity.ok(cartService.removeItem(getUserId(userId), productId));
    }

    @DeleteMapping
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<Void> clearCart(
            @RequestHeader("X-User-Id") String userId) {
        cartService.clearCart(getUserId(userId));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    @Operation(summary = "Checkout cart and create order")
    public ResponseEntity<OrderResponse> checkout(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.checkoutCart(getUserId(userId), request));
    }
}
