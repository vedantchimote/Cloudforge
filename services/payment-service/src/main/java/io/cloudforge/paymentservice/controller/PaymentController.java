package io.cloudforge.paymentservice.controller;

import io.cloudforge.paymentservice.dto.PaymentRequest;
import io.cloudforge.paymentservice.dto.PaymentResponse;
import io.cloudforge.paymentservice.dto.PaymentVerificationRequest;
import io.cloudforge.paymentservice.dto.RefundRequest;
import io.cloudforge.paymentservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payments", description = "Payment processing endpoints")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Initiate a payment", description = "Creates a Razorpay order for payment")
    @PostMapping
    public ResponseEntity<PaymentResponse> initiatePayment(
            @Valid @RequestBody PaymentRequest request) {
        log.info("Initiating payment for order: {}", request.getOrderId());
        PaymentResponse response = paymentService.initiatePayment(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Verify payment", description = "Verifies payment after Razorpay checkout completion")
    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {
        log.info("Verifying payment for order: {}", request.getOrderId());
        PaymentResponse response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get payment by ID")
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable UUID id) {
        PaymentResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get payment by order ID")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(@PathVariable UUID orderId) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get payments for user")
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PaymentResponse>> getPaymentsByUserId(
            @PathVariable UUID userId,
            Pageable pageable) {
        Page<PaymentResponse> payments = paymentService.getPaymentsByUserId(userId, pageable);
        return ResponseEntity.ok(payments);
    }

    @Operation(summary = "Refund a payment")
    @PostMapping("/{id}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(
            @PathVariable UUID id,
            @Valid @RequestBody RefundRequest request) {
        log.info("Processing refund for payment: {}", id);
        PaymentResponse response = paymentService.refundPayment(id, request);
        return ResponseEntity.ok(response);
    }
}
