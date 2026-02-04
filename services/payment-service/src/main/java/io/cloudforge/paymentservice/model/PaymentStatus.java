package io.cloudforge.paymentservice.model;

public enum PaymentStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
    REFUNDED,
    PARTIALLY_REFUNDED;

    public boolean isRefundable() {
        return this == COMPLETED || this == PARTIALLY_REFUNDED;
    }

    public boolean isFinal() {
        return this == COMPLETED || this == FAILED || this == REFUNDED;
    }
}
