package io.cloudforge.orderservice.dto;

import io.cloudforge.orderservice.model.Cart;
import io.cloudforge.orderservice.model.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private UUID userId;
    private List<CartItem> items;
    private BigDecimal totalAmount;
    private int itemCount;
    private Instant updatedAt;

    public static CartResponse fromCart(Cart cart) {
        return CartResponse.builder()
                .userId(cart.getUserId())
                .items(cart.getItems())
                .totalAmount(cart.getTotalAmount())
                .itemCount(cart.getItemCount())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}
