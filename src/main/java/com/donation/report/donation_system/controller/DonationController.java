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
}

