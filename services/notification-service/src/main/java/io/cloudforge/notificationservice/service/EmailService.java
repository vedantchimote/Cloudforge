package io.cloudforge.notificationservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${notification.from-email}")
    private String fromEmail;

    @Value("${notification.from-name}")
    private String fromName;

    /**
     * Sends an HTML email synchronously.
     */
    public void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        log.info("Sending email to: {} with subject: {}", to, subject);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        try {
            helper.setFrom(fromEmail, fromName);
        } catch (UnsupportedEncodingException e) {
            log.warn("Unsupported encoding for from name, using email only", e);
            helper.setFrom(fromEmail);
        }

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        try {
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MailException e) {
            log.error("Failed to send email to: {}", to, e);
            throw e;
        }
    }

    /**
     * Sends an HTML email asynchronously.
     */
    @Async
    public CompletableFuture<Boolean> sendEmailAsync(String to, String subject, String htmlContent) {
        try {
            sendEmail(to, subject, htmlContent);
            return CompletableFuture.completedFuture(true);
        } catch (Exception e) {
            log.error("Async email send failed to: {}", to, e);
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Sends a plain text email.
     */
    public void sendPlainTextEmail(String to, String subject, String textContent) throws MessagingException {
        log.info("Sending plain text email to: {}", to);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

        try {
            helper.setFrom(fromEmail, fromName);
        } catch (UnsupportedEncodingException e) {
            log.warn("Unsupported encoding for from name, using email only", e);
            helper.setFrom(fromEmail);
        }

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(textContent, false);

        mailSender.send(message);
        log.info("Plain text email sent to: {}", to);
    }
}
