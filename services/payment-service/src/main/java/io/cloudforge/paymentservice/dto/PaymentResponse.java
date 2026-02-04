package io.cloudforge.paymentservice.dto;

import io.cloudforge.paymentservice.model.Payment;
import io.cloudforge.paymentservice.model.PaymentMethod;
import io.cloudforge.paymentservice.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID id;
    private UUID orderId;
    private UUID userId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpayKeyId;
    private String failureReason;
    private BigDecimal refundedAmount;
    private Instant createdAt;
    private Instant updatedAt;

    public static PaymentResponse fromPayment(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .failureReason(payment.getFailureReason())
                .refundedAmount(payment.getRefundedAmount())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    public static PaymentResponse fromPayment(Payment payment, String razorpayKeyId) {
        PaymentResponse response = fromPayment(payment);
        response.setRazorpayKeyId(razorpayKeyId);
        return response;
    }
}
