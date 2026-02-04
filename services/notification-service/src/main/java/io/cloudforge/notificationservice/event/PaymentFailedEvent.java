package io.cloudforge.notificationservice.event;

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
public class PaymentFailedEvent {

    private UUID paymentId;
    private UUID orderId;
    private UUID userId;
    private String userEmail;
    private String customerName;
    private BigDecimal amount;
    private String failureReason;
    private Instant failedAt;
}
