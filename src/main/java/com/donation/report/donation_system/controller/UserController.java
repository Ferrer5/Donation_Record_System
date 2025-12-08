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
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetService passwordResetService;

    @GetMapping("/check-username")
    public Map<String, Object> checkUsernameAvailability(@RequestParam String username) {
        Map<String, Object> response = new HashMap<>();
        User user = userRepository.findByUsername(username);
        boolean exists = user != null;
        response.put("available", !exists);
        return response;
    }
    
    @GetMapping("/check-email")
    public Map<String, Object> checkEmailAvailability(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        User user = userRepository.findByEmail(email);
        boolean exists = user != null;
        response.put("available", !exists);
        System.out.println("Response: " + response);
        return response;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

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

    @PostMapping("/forgot-password")
    public Map<String, Object> requestPasswordReset(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String email = payload.get("email");

        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return response;
        }

        try {
            User user = userRepository.findByEmail(email);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "No account found with that email address");
                return response;
            }

            String verificationCode = passwordResetService.generateAndStoreCode(email);
            
            emailService.sendVerificationCode(email, user.getUsername(), verificationCode);
            
            response.put("success", true);
            response.put("message", "Verification code sent to your email");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error sending verification code: " + e.getMessage());
        }
        
        return response;
    }

    @PostMapping("/verify-code")
    public Map<String, Object> verifyCode(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String email = payload.get("email");
        String code = payload.get("code");

        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return response;
        }

        if (code == null || code.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Verification code is required");
            return response;
        }

        try {
            boolean isValid = passwordResetService.verifyCode(email, code);
            
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

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String email = payload.get("email");
        String code = payload.get("code");
        String newPassword = payload.get("newPassword");
        String confirmPassword = payload.get("confirmPassword");

        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
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
            User user = userRepository.findByEmail(email);
            if (user == null) {
                response.put("success", false);
                response.put("message", "No account found with that email address");
                return response;
            }

            boolean isValid = passwordResetService.verifyCode(email, code);
            
            if (!isValid) {
                response.put("success", false);
                response.put("message", "Invalid or expired verification code");
                return response;
            }

            user.setPassword(newPassword);
            userRepository.save(user);
            
            passwordResetService.removeCode(email);
            
            response.put("success", true);
            response.put("message", "Password reset successfully!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error resetting password: " + e.getMessage());
        }
        
        return response;
    }

    @PostMapping("/check-password")
    public Map<String, Object> checkPassword(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String email = payload.get("email");
        String password = payload.get("password");

        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email is required");
            return response;
        }

        try {
            User user = userRepository.findByEmail(email);
            if (user == null) {
                response.put("success", false);
                response.put("message", "No account found with that email address");
                return response;
            }

            boolean isSamePassword = user.getPassword().equals(password);
            response.put("success", true);
            response.put("isSamePassword", isSamePassword);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error checking password: " + e.getMessage());
        }
        
        return response;
    }

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
