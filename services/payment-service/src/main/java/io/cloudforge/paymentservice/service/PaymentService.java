package io.cloudforge.paymentservice.service;

import com.razorpay.Order;
import com.razorpay.RazorpayException;
import io.cloudforge.paymentservice.dto.PaymentRequest;
import io.cloudforge.paymentservice.dto.PaymentResponse;
import io.cloudforge.paymentservice.dto.PaymentVerificationRequest;
import io.cloudforge.paymentservice.dto.RefundRequest;
import io.cloudforge.paymentservice.event.EventPublisher;
import io.cloudforge.paymentservice.event.PaymentCompletedEvent;
import io.cloudforge.paymentservice.event.PaymentFailedEvent;
import io.cloudforge.paymentservice.exception.DuplicatePaymentException;
import io.cloudforge.paymentservice.exception.PaymentNotFoundException;
import io.cloudforge.paymentservice.exception.PaymentProcessingException;
import io.cloudforge.paymentservice.exception.RefundException;
import io.cloudforge.paymentservice.model.Payment;
import io.cloudforge.paymentservice.model.PaymentStatus;
import io.cloudforge.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayService razorpayService;
    private final IdempotencyService idempotencyService;
    private final EventPublisher eventPublisher;

    /**
     * Initiates a payment by creating a Razorpay Order.
     * Returns the order details for frontend to complete payment.
     */
    public PaymentResponse initiatePayment(PaymentRequest request) {
        String idempotencyKey = request.getIdempotencyKey();
        log.info("Initiating payment for order: {}", request.getOrderId());

        // 1. Check for duplicate request
        if (idempotencyService.isProcessed(idempotencyKey)) {
            log.info("Duplicate request detected: {}", idempotencyKey);
            return idempotencyService.getResult(idempotencyKey, PaymentResponse.class);
        }

        // 2. Check if payment already exists for order
        Optional<Payment> existingPayment = paymentRepository.findByOrderId(request.getOrderId());
        if (existingPayment.isPresent()) {
            Payment existing = existingPayment.get();
            if (existing.getStatus() == PaymentStatus.COMPLETED) {
                throw new DuplicatePaymentException("Payment already completed for order: " + request.getOrderId());
            }
            // Return existing pending payment
            return PaymentResponse.fromPayment(existing, razorpayService.getKeyId());
        }

        // 3. Create payment record
        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .paymentMethod(request.getPaymentMethod())
                .idempotencyKey(idempotencyKey)
                .status(PaymentStatus.PENDING)
                .build();

        try {
            // 4. Create Razorpay Order
            Order razorpayOrder = razorpayService.createOrder(
                    payment.getAmount(),
                    payment.getCurrency(),
                    "order_" + request.getOrderId().toString().substring(0, 8),
                    idempotencyKey);

            payment.setRazorpayOrderId(razorpayOrder.get("id").toString());
            payment.setStatus(PaymentStatus.PROCESSING);

        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());

            // Publish failure event
            publishPaymentFailed(payment);
        }

        Payment saved = paymentRepository.save(payment);
        PaymentResponse response = PaymentResponse.fromPayment(saved, razorpayService.getKeyId());

        // 5. Store result for idempotency
        idempotencyService.markAsProcessed(idempotencyKey, response);

        return response;
    }

    /**
     * Verifies payment after frontend completes Razorpay checkout.
     */
    public PaymentResponse verifyPayment(PaymentVerificationRequest request) {
        log.info("Verifying payment for order: {}", request.getOrderId());

        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(
                        () -> new PaymentNotFoundException("Payment not found for order: " + request.getOrderId()));

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            return PaymentResponse.fromPayment(payment, razorpayService.getKeyId());
        }

        // Verify signature
        boolean isValid = razorpayService.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature());

        if (isValid) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(PaymentStatus.COMPLETED);

            // Publish success event
            eventPublisher.publishPaymentCompleted(PaymentCompletedEvent.builder()
                    .paymentId(payment.getId())
                    .orderId(payment.getOrderId())
                    .userId(payment.getUserId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .status("COMPLETED")
                    .stripePaymentIntentId(payment.getRazorpayPaymentId())
                    .completedAt(Instant.now())
                    .build());

            log.info("Payment verified successfully for order: {}", request.getOrderId());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Payment signature verification failed");

            publishPaymentFailed(payment);

            throw new PaymentProcessingException("Payment verification failed");
        }

        return PaymentResponse.fromPayment(paymentRepository.save(payment), razorpayService.getKeyId());
    }

    /**
     * Get payment by ID.
     */
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));
        return PaymentResponse.fromPayment(payment, razorpayService.getKeyId());
    }

    /**
     * Get payment by order ID.
     */
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for order: " + orderId));
        return PaymentResponse.fromPayment(payment, razorpayService.getKeyId());
    }

    /**
     * Get all payments for a user.
     */
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPaymentsByUserId(UUID userId, Pageable pageable) {
        return paymentRepository.findByUserId(userId, pageable)
                .map(p -> PaymentResponse.fromPayment(p, razorpayService.getKeyId()));
    }

    /**
     * Process refund for a payment.
     */
    public PaymentResponse refundPayment(UUID paymentId, RefundRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));

        if (!payment.getStatus().isRefundable()) {
            throw new RefundException("Only completed payments can be refunded");
        }

        BigDecimal refundAmount = request.getAmount() != null ? request.getAmount() : payment.getAmount();
        BigDecimal totalRefunded = payment.getRefundedAmount().add(refundAmount);

        if (totalRefunded.compareTo(payment.getAmount()) > 0) {
            throw new RefundException("Refund amount exceeds payment amount");
        }

        try {
            razorpayService.createRefund(payment.getRazorpayPaymentId(), refundAmount);

            payment.setRefundedAmount(totalRefunded);
            if (totalRefunded.compareTo(payment.getAmount()) == 0) {
                payment.setStatus(PaymentStatus.REFUNDED);
            } else {
                payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
            }

            log.info("Refund processed for payment: {} amount: {}", paymentId, refundAmount);

        } catch (RazorpayException e) {
            log.error("Refund failed: {}", e.getMessage());
            throw new RefundException("Refund failed: " + e.getMessage());
        }

        return PaymentResponse.fromPayment(paymentRepository.save(payment), razorpayService.getKeyId());
    }

    private void publishPaymentFailed(Payment payment) {
        eventPublisher.publishPaymentFailed(PaymentFailedEvent.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .failureReason(payment.getFailureReason())
                .failedAt(Instant.now())
                .build());
    }
}
