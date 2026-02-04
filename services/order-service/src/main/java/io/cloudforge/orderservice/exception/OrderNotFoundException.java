package io.cloudforge.orderservice.exception;

public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(String message) {
        super(message);
    }

    public OrderNotFoundException(java.util.UUID orderId) {
        super("Order not found with ID: " + orderId);
    }
}
