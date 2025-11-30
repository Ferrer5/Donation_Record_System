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
     * @param username Username
     * @param email Email address
     * @return Generated 6-digit code
     */
    public String generateAndStoreCode(String username, String email) {
        // Remove any existing code for this user
        verificationCodes.remove(username);
        
        // Generate random 6-digit code
        Random random = new Random();
        String code = String.format("%06d", random.nextInt(1000000));
        
        // Store code with expiration time
        long expirationTime = System.currentTimeMillis() + (CODE_EXPIRATION_MINUTES * 60 * 1000);
        verificationCodes.put(username, new VerificationCode(code, email, expirationTime));
        
        return code;
    }

    /**
     * Verify if the provided code is correct and not expired
     * @param username Username
     * @param code Verification code
     * @return true if code is valid, false otherwise
     */
    public boolean verifyCode(String username, String code) {
        VerificationCode storedCode = verificationCodes.get(username);
        
        if (storedCode == null) {
            return false;
        }
        
        // Check if code is expired
        if (System.currentTimeMillis() > storedCode.getExpirationTime()) {
            verificationCodes.remove(username);
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
     * @param username Username
     */
    public void removeCode(String username) {
        verificationCodes.remove(username);
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
        private final String email;
        private final long expirationTime;

        public VerificationCode(String code, String email, long expirationTime) {
            this.code = code;
            this.email = email;
            this.expirationTime = expirationTime;
        }

        public String getCode() {
            return code;
        }

        public String getEmail() {
            return email;
        }

        public long getExpirationTime() {
            return expirationTime;
        }
    }
}

