package io.cloudforge.paymentservice.service;

import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() throws RazorpayException {
        razorpayClient = new RazorpayClient(keyId, keySecret);
        log.info("Razorpay SDK initialized with key: {}", keyId.substring(0, 10) + "...");
    }

    /**
     * Creates a Razorpay Order for payment.
     * The order ID is used by frontend to initiate checkout.
     */
    public Order createOrder(BigDecimal amount, String currency, String receipt, String idempotencyKey)
            throws RazorpayException {

        log.debug("Creating Razorpay Order for amount: {} {}", amount, currency);

        JSONObject orderRequest = new JSONObject();
        // Razorpay expects amount in smallest currency unit (paise for INR)
        orderRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
        orderRequest.put("currency", currency.toUpperCase());
        orderRequest.put("receipt", receipt);

        JSONObject notes = new JSONObject();
        notes.put("idempotency_key", idempotencyKey);
        orderRequest.put("notes", notes);

        Order order = razorpayClient.orders.create(orderRequest);
        log.info("Created Razorpay Order: {} with status: {}", order.get("id"), order.get("status"));

        return order;
    }

    /**
     * Retrieves a Razorpay Order by ID.
     */
    public Order fetchOrder(String orderId) throws RazorpayException {
        return razorpayClient.orders.fetch(orderId);
    }

    /**
     * Retrieves a Razorpay Payment by ID.
     */
    public Payment fetchPayment(String paymentId) throws RazorpayException {
        return razorpayClient.payments.fetch(paymentId);
    }

    /**
     * Captures a payment (if not auto-captured).
     */
    public Payment capturePayment(String paymentId, BigDecimal amount, String currency)
            throws RazorpayException {

        log.debug("Capturing payment: {} for amount: {}", paymentId, amount);

        JSONObject captureRequest = new JSONObject();
        captureRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
        captureRequest.put("currency", currency.toUpperCase());

        Payment payment = razorpayClient.payments.capture(paymentId, captureRequest);
        log.info("Captured payment: {} with status: {}", paymentId, payment.get("status"));

        return payment;
    }

    /**
     * Creates a refund for a payment.
     */
    public Refund createRefund(String paymentId, BigDecimal amount) throws RazorpayException {
        log.debug("Creating refund for payment: {} amount: {}", paymentId, amount);

        JSONObject refundRequest = new JSONObject();
        if (amount != null) {
            refundRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
        }

        Refund refund = razorpayClient.payments.refund(paymentId, refundRequest);
        log.info("Created Refund: {} with status: {}", refund.get("id"), refund.get("status"));

        return refund;
    }

    /**
     * Verifies payment signature from webhook.
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            com.razorpay.Utils.verifyPaymentSignature(attributes, keySecret);
            return true;
        } catch (RazorpayException e) {
            log.error("Payment signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    public String getKeyId() {
        return keyId;
    }
}
