package com.donation.report.donation_system.controller;

import com.donation.report.donation_system.entity.Donation;
import com.donation.report.donation_system.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class DonationController {

    @Autowired
    private DonationRepository donationRepository;

    // SUBMIT DONATION
    @PostMapping("/submit")
    public Map<String, Object> submitDonation(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Donation donation = new Donation();
            donation.setUsername((String) payload.get("username"));
            donation.setFullName((String) payload.get("fullName"));
            donation.setEmail((String) payload.get("email"));
            donation.setDonationType((String) payload.get("donationType"));
            donation.setAmount(Double.parseDouble(payload.get("amount").toString()));
            donation.setMessage((String) payload.get("message"));
            donation.setStatus("PENDING");
            
            donationRepository.save(donation);
            
            response.put("success", true);
            response.put("message", "Donation submitted successfully! Waiting for admin approval.");
            response.put("donationId", donation.getId());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error submitting donation: " + e.getMessage());
        }
        
        return response;
    }

    // GET USER DONATIONS (for history)
    @GetMapping("/user/{username}")
    public Map<String, Object> getUserDonations(@PathVariable String username) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Donation> donations = donationRepository.findByUsernameOrderByCreatedAtDesc(username);
            response.put("success", true);
            response.put("donations", donations);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching donations: " + e.getMessage());
        }
        
        return response;
    }

    // GET PENDING DONATIONS (for admin)
    @GetMapping("/pending")
    public Map<String, Object> getPendingDonations() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Donation> donations = donationRepository.findByStatusOrderByCreatedAtDesc("PENDING");
            response.put("success", true);
            response.put("donations", donations);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching pending donations: " + e.getMessage());
        }
        
        return response;
    }

    // GET ALL DONATIONS (for admin)
    @GetMapping("/all")
    public Map<String, Object> getAllDonations() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Donation> donations = donationRepository.findAllByOrderByCreatedAtDesc();
            response.put("success", true);
            response.put("donations", donations);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching donations: " + e.getMessage());
        }
        
        return response;
    }

    // APPROVE DONATION
    @PutMapping("/{id}/approve")
    public Map<String, Object> approveDonation(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (id == null) {
                response.put("success", false);
                response.put("message", "Invalid donation ID");
                return response;
            }
            
            Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found with id: " + id));
            
            donation.setStatus("APPROVED");
            donationRepository.save(donation);
            
            response.put("success", true);
            response.put("message", "Donation approved successfully!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error approving donation: " + e.getMessage());
        }
        
        return response;
    }

    // GET USER NOTIFICATIONS (approved donations)
    @GetMapping("/user/{username}/notifications")
    public Map<String, Object> getUserNotifications(@PathVariable String username) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Donation> donations = donationRepository.findByUsernameOrderByCreatedAtDesc(username);
            // Filter for approved donations (recent notifications)
            List<Donation> notifications = donations.stream()
                .filter(d -> "APPROVED".equals(d.getStatus()))
                .limit(10) // Get last 10 approved donations
                .toList();
            
            response.put("success", true);
            response.put("notifications", notifications);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching notifications: " + e.getMessage());
        }
        
        return response;
    }

    // DELETE DONATION
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteDonation(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (id == null) {
                response.put("success", false);
                response.put("message", "Invalid donation ID");
                return response;
            }
            
            if (!donationRepository.existsById(id)) {
                response.put("success", false);
                response.put("message", "Donation not found with id: " + id);
                return response;
            }
            
            donationRepository.deleteById(id);
            
            response.put("success", true);
            response.put("message", "Donation removed successfully!");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error removing donation: " + e.getMessage());
        }
        
        return response;
    }

    // ADMIN ADD RECORD (admin can add donation records directly, auto-approved)
    @PostMapping("/admin/add")
    public Map<String, Object> adminAddRecord(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Donation donation = new Donation();
            
            // For admin-added records, use admin username or a system default
            // Note: The username must exist in users table due to foreign key constraint
            // If adding records for non-users, create a system user account first
            String donorName = (String) payload.get("donorName");
            String username = (String) payload.get("username");
            if (username == null || username.trim().isEmpty()) {
                // Default to a system username - admin should ensure this user exists
                // Or create a system user account in the database
                username = "admin_system";
            }
            
            donation.setUsername(username);
            donation.setFullName(donorName != null ? donorName : "Unknown Donor");
            donation.setEmail((String) payload.get("email"));
            if (donation.getEmail() == null || donation.getEmail().trim().isEmpty()) {
                donation.setEmail("noemail@donation.local");
            }
            
            String donationType = (String) payload.get("donationType");
            if (donationType == null || donationType.trim().isEmpty()) {
                donationType = (String) payload.get("otherDonation");
            }
            donation.setDonationType(donationType != null ? donationType : "Others");
            
            // Handle amount - for goods, store 0 and put description in message
            Object amountObj = payload.get("amount");
            Double amount = 0.0;
            String message = (String) payload.get("message");
            
            if (amountObj != null) {
                try {
                    amount = Double.parseDouble(amountObj.toString());
                } catch (NumberFormatException e) {
                    amount = 0.0;
                }
            }
            
            // If it's goods and no amount, put description in message
            if (("Goods".equalsIgnoreCase(donationType) || "Others".equalsIgnoreCase(donationType)) && amount == 0) {
                String itemsDescription = (String) payload.get("itemsDescription");
                if (itemsDescription != null && !itemsDescription.trim().isEmpty()) {
                    message = message != null ? message + "\nItems: " + itemsDescription : "Items: " + itemsDescription;
                }
            }
            
            donation.setAmount(amount);
            donation.setMessage(message);
            donation.setStatus("APPROVED"); // Admin-added records are auto-approved
            
            donationRepository.save(donation);
            
            response.put("success", true);
            response.put("message", "Donation record added successfully!");
            response.put("donationId", donation.getId());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error adding donation record: " + e.getMessage());
        }
        
        return response;
    }
}

