package io.cloudforge.orderservice.exception;

public class CartEmptyException extends RuntimeException {
    public CartEmptyException() {
        super("Cart is empty, cannot proceed with checkout");
    }
}
