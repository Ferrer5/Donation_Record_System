package com.donation.report.donation_system.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@donationsystem.com}")
    private String mailFrom;
    public void sendVerificationCode(String toEmail, String username, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Password Reset Verification Code - Donation System");
            message.setText(
                "Hello " + username + ",\n\n" +
                "You have requested to reset your password for the Donation Report System.\n\n" +
                "Your verification code is: " + verificationCode + "\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you did not request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Donation Report System Team"
            );

            message.setFrom(mailFrom);
            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}

