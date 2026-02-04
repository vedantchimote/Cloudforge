package io.cloudforge.orderservice.service;

import io.cloudforge.orderservice.client.ProductClient;
import io.cloudforge.orderservice.client.ProductResponse;
import io.cloudforge.orderservice.dto.CartItemRequest;
import io.cloudforge.orderservice.dto.CartResponse;
import io.cloudforge.orderservice.model.Cart;
import io.cloudforge.orderservice.model.CartItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final RedisTemplate<String, Cart> cartRedisTemplate;
    private final ProductClient productClient;

    private static final String CART_PREFIX = "cart:";

    @Value("${cart.ttl-days:7}")
    private long cartTtlDays;

    public CartResponse getCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return CartResponse.fromCart(cart);
    }

    public CartResponse addItem(UUID userId, CartItemRequest request) {
        log.info("Adding item {} to cart for user {}", request.getProductId(), userId);

        // Fetch product details from Product Service
        ProductResponse product = productClient.getProduct(request.getProductId());

        Cart cart = getOrCreateCart(userId);

        CartItem item = CartItem.builder()
                .productId(product.getId())
                .productName(product.getName())
                .quantity(request.getQuantity())
                .unitPrice(product.getPrice())
                .imageUrl(product.getImages() != null && !product.getImages().isEmpty()
                        ? product.getImages().get(0)
                        : null)
                .build();

        cart.addItem(item);
        saveCart(userId, cart);

        log.info("Item added to cart. Cart now has {} items", cart.getItemCount());
        return CartResponse.fromCart(cart);
    }

    public CartResponse updateItemQuantity(UUID userId, String productId, int quantity) {
        log.info("Updating quantity for product {} in cart for user {}", productId, userId);

        Cart cart = getOrCreateCart(userId);

        if (quantity <= 0) {
            cart.removeItem(productId);
        } else {
            cart.updateItemQuantity(productId, quantity);
        }

        saveCart(userId, cart);
        return CartResponse.fromCart(cart);
    }

    public CartResponse removeItem(UUID userId, String productId) {
        log.info("Removing item {} from cart for user {}", productId, userId);

        Cart cart = getOrCreateCart(userId);
        cart.removeItem(productId);
        saveCart(userId, cart);

        return CartResponse.fromCart(cart);
    }

    public void clearCart(UUID userId) {
        log.info("Clearing cart for user {}", userId);
        cartRedisTemplate.delete(CART_PREFIX + userId);
    }

    public Cart getCartEntity(UUID userId) {
        return getOrCreateCart(userId);
    }

    private Cart getOrCreateCart(UUID userId) {
        String key = CART_PREFIX + userId;
        Cart cart = cartRedisTemplate.opsForValue().get(key);

        if (cart == null) {
            cart = Cart.builder()
                    .userId(userId)
                    .build();
        }

        return cart;
    }

    private void saveCart(UUID userId, Cart cart) {
        String key = CART_PREFIX + userId;
        cartRedisTemplate.opsForValue().set(key, cart, cartTtlDays, TimeUnit.DAYS);
    }
}
