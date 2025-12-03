package com.donation.report.donation_system.controller;

import com.donation.report.donation_system.entity.User;
import com.donation.report.donation_system.repository.UserRepository;
import com.donation.report.donation_system.service.EmailService;
import com.donation.report.donation_system.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // allow your JS frontend to connect
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetService passwordResetService;

    // CHECK USERNAME AVAILABILITY
    @GetMapping("/check-username")
    public Map<String, Object> checkUsernameAvailability(@RequestParam String username) {
        System.out.println("Checking username: " + username); // Debug log
        Map<String, Object> response = new HashMap<>();
        User user = userRepository.findByUsername(username);
        System.out.println("User found: " + (user != null ? user.getUsername() : "null")); // Debug log
        boolean exists = user != null;
        response.put("available", !exists);
        System.out.println("Response: " + response); // Debug log
        return response;
    }
    
    @GetMapping("/check-email")
    public Map<String, Object> checkEmailAvailability(@RequestParam String email) {
        System.out.println("Checking email: " + email); // Debug log
        Map<String, Object> response = new HashMap<>();
        User user = userRepository.findByEmail(email);
        System.out.println("User found with email: " + (user != null ? user.getEmail() : "null"));
        boolean exists = user != null;
        response.put("available", !exists);
        System.out.println("Response: " + response);
        return response;
    }

    // LIST USERS
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String,Object> loginUser(@RequestBody Map<String,String> payload) {
        Map<String,Object> response = new HashMap<>();
        String username = payload.get("username");
        String password = payload.get("password");

        User user = userRepository.findByUsername(username);
        if(user != null && user.getPassword().equals(password)) {
            response.put("success", true);
            response.put("message", "Login successful!");
        } else {
            response.put("success", false);
            response.put("message", "Invalid username or password");
        }
        return response;
    }

    // SIGNUP
    @PostMapping("/signup")
    public Map<String,Object> signupUser(@RequestBody Map<String,String> payload) {
        Map<String,Object> response = new HashMap<>();
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");

        if(userRepository.findByUsername(username) != null) {
            response.put("success", false);
            response.put("message", "Username already exists");
            return response;
        }
        if(userRepository.findByEmail(email) != null) {
            response.put("success", false);
            response.put("message", "Email already exists");
            return response;
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Signup successful!");
        return response;
    }

    // FORGOT PASSWORD - REQUEST CODE
    @PostMapping("/forgot-password")
    public Map<String, Object> requestPasswordReset(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String username = payload.get("username");
        String email = payload.get("email");

        if (username == null || username.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Username is required");
            return response;
        }

        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return response;
        }

        try {
            User user = userRepository.findByUsername(username);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "Username not found");
                return response;
            }

            if (!user.getEmail().equalsIgnoreCase(email)) {
                response.put("success", false);
                response.put("message", "Email does not match the username");
                return response;
            }

            // Generate and store verification code
            String verificationCode = passwordResetService.generateAndStoreCode(email);
            
            // Send email with verification code
            emailService.sendVerificationCode(email, username, verificationCode);
            
            response.put("success", true);
            response.put("message", "Verification code sent to your email");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error sending verification code: " + e.getMessage());
        }
        
        return response;
    }

    // VERIFY CODE
    @PostMapping("/verify-code")
    public Map<String, Object> verifyCode(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String username = payload.get("username");
        String code = payload.get("code");

        if (username == null || username.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Username is required");
            return response;
        }

        if (code == null || code.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Verification code is required");
            return response;
        }

        try {
            boolean isValid = passwordResetService.verifyCode(username, code);
            
            if (isValid) {
                response.put("success", true);
                response.put("message", "Verification code is valid");
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired verification code");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error verifying code: " + e.getMessage());
        }
        
        return response;
    }

    // RESET PASSWORD
    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String username = payload.get("username");
        String code = payload.get("code");
        String newPassword = payload.get("newPassword");
        String confirmPassword = payload.get("confirmPassword");

        if (username == null || username.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Username is required");
            return response;
        }

        if (code == null || code.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Verification code is required");
            return response;
        }

        if (newPassword == null || newPassword.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "New password is required");
            return response;
        }

        if (!newPassword.equals(confirmPassword)) {
            response.put("success", false);
            response.put("message", "Passwords do not match");
            return response;
        }

        try {
            // Verify code first
            boolean isValid = passwordResetService.verifyCode(username, code);
            
            if (!isValid) {
                response.put("success", false);
                response.put("message", "Invalid or expired verification code");
                return response;
            }

            // Update password
            User user = userRepository.findByUsername(username);
            if (user == null) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            user.setPassword(newPassword);
            userRepository.save(user);
            
            // Remove verification code after successful reset
            passwordResetService.removeCode(username);
            
            response.put("success", true);
            response.put("message", "Password reset successfully!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error resetting password: " + e.getMessage());
        }
        
        return response;
    }

    // DELETE ACCOUNT
    @DeleteMapping("/delete-account")
    public Map<String, Object> deleteAccount(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String username = payload.get("username");

        if (username == null || username.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Username is required");
            return response;
        }

        try {
            User user = userRepository.findByUsername(username);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            // Delete user (this will cascade delete donations due to foreign key constraint)
            userRepository.delete(user);
            
            response.put("success", true);
            response.put("message", "Account deleted successfully");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting account: " + e.getMessage());
        }
        
        return response;
    }
}
