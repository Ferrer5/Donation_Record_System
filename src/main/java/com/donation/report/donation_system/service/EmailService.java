package com.donation.report.donation_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Send verification code email
     * @param toEmail Recipient email address
     * @param username Username of the user
     * @param verificationCode 6-digit verification code
     */
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
            message.setFrom("noreply@donationsystem.com");
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}

