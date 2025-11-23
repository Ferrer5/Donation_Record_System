package com.donation.report.donation_system.controller;

import com.donation.report.donation_system.entity.Admin;
import com.donation.report.donation_system.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    // ADMIN LOGIN
    @PostMapping("/login")
    public Map<String, Object> loginAdmin(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String adminName = payload.get("adminName");
        String password = payload.get("password");

        if (adminName == null || adminName.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Admin name is required");
            return response;
        }

        if (password == null || password.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Password is required");
            return response;
        }

        Admin admin = adminRepository.findByAdminName(adminName);
        if (admin != null && admin.getPassword().equals(password)) {
            response.put("success", true);
            response.put("message", "Admin login successful!");
            response.put("adminName", admin.getAdminName());
        } else {
            response.put("success", false);
            response.put("message", "Invalid admin name or password");
        }
        return response;
    }
}

