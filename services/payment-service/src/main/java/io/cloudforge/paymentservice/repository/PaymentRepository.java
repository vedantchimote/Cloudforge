package io.cloudforge.paymentservice.repository;

import io.cloudforge.paymentservice.model.Payment;
import io.cloudforge.paymentservice.model.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByOrderId(UUID orderId);

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    Page<Payment> findByUserId(UUID userId, Pageable pageable);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    boolean existsByOrderId(UUID orderId);

    boolean existsByIdempotencyKey(String idempotencyKey);
}
