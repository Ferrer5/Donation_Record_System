package com.donation.report.donation_system.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class PasswordResetService {

    private final Map<String, VerificationCode> verificationCodes = new ConcurrentHashMap<>();
    private static final int CODE_EXPIRATION_MINUTES = 10;
    private static final int CODE_LENGTH = 6;

    /**
     * Generate and store a verification code for a user
     * @param email Email address
     * @return Generated 6-digit code
     */
    public String generateAndStoreCode(String email) {
        // Remove any existing code for this email
        verificationCodes.remove(email);
        
        // Generate random code using the defined length
        Random random = new Random();
        String code = String.format("%0" + CODE_LENGTH + "d", 
            random.nextInt((int) Math.pow(10, CODE_LENGTH)));
        
        // Store code with expiration time
        long expirationTime = System.currentTimeMillis() + (CODE_EXPIRATION_MINUTES * 60 * 1000);
        verificationCodes.put(email, new VerificationCode(code, expirationTime));
        
        return code;
    }

    /**
     * Verify if the provided code is correct and not expired
     * @param email Email address
     * @param code Verification code
     * @return true if code is valid, false otherwise
     */
    public boolean verifyCode(String email, String code) {
        VerificationCode storedCode = verificationCodes.get(email);
        
        if (storedCode == null) {
            return false;
        }
        
        // Check if code is expired
        if (System.currentTimeMillis() > storedCode.getExpirationTime()) {
            verificationCodes.remove(email);
            return false;
        }
        
        // Check if code matches
        if (!storedCode.getCode().equals(code)) {
            return false;
        }
        
        return true;
    }

    /**
     * Remove verification code after successful password reset
     * @param email Email address
     */
    public void removeCode(String email) {
        verificationCodes.remove(email);
    }

    /**
     * Clean up expired codes (can be called periodically)
     */
    public void cleanupExpiredCodes() {
        long currentTime = System.currentTimeMillis();
        verificationCodes.entrySet().removeIf(entry -> 
            currentTime > entry.getValue().getExpirationTime()
        );
    }

    /**
     * Inner class to store verification code with expiration
     */
    private static class VerificationCode {
        private final String code;
        private final long expirationTime;

        public VerificationCode(String code, long expirationTime) {
            this.code = code;
            this.expirationTime = expirationTime;
        }

        public String getCode() {
            return code;
        }

        public long getExpirationTime() {
            return expirationTime;
        }
    }
}

