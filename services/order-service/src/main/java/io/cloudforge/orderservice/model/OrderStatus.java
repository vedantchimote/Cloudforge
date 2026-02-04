package io.cloudforge.orderservice.model;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    public boolean isCancellable() {
        return this == PENDING || this == CONFIRMED;
    }

    public boolean isModifiable() {
        return this == PENDING;
    }
}
