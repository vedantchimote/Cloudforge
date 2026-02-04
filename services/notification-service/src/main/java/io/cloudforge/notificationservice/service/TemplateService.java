package io.cloudforge.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateService {

    private final TemplateEngine templateEngine;

    /**
     * Renders an email template with the provided data.
     */
    public String renderTemplate(String templateName, Map<String, Object> templateData) {
        log.debug("Rendering template: {}", templateName);

        Context context = new Context();
        if (templateData != null) {
            templateData.forEach(context::setVariable);
        }

        String rendered = templateEngine.process("email/" + templateName, context);
        log.debug("Template {} rendered successfully", templateName);

        return rendered;
    }

    /**
     * Get template name based on notification type.
     */
    public String getTemplateForType(String notificationType) {
        return switch (notificationType) {
            case "ORDER_CONFIRMATION" -> "order-confirmation";
            case "PAYMENT_SUCCESS" -> "payment-success";
            case "PAYMENT_FAILED" -> "payment-failed";
            case "WELCOME" -> "welcome";
            case "ORDER_SHIPPED" -> "order-shipped";
            case "ORDER_CANCELLED" -> "order-cancelled";
            default -> "base";
        };
    }

    /**
     * Get email subject based on notification type.
     */
    public String getSubjectForType(String notificationType, Map<String, Object> data) {
        String orderId = data != null ? String.valueOf(data.getOrDefault("orderId", "")) : "";

        return switch (notificationType) {
            case "ORDER_CONFIRMATION" -> "Order Confirmed! " + orderId;
            case "PAYMENT_SUCCESS" -> "Payment Successful! ✓";
            case "PAYMENT_FAILED" -> "Payment Failed - Action Required";
            case "WELCOME" -> "Welcome to CloudForge! 🎉";
            case "ORDER_SHIPPED" -> "Your Order Has Shipped! 🚀";
            case "ORDER_CANCELLED" -> "Order Cancelled " + orderId;
            default -> "Notification from CloudForge";
        };
    }
}
