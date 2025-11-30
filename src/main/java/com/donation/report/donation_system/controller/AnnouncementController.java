package com.donation.report.donation_system.controller;

import com.donation.report.donation_system.entity.Announcement;
import com.donation.report.donation_system.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping("")
    public Map<String, Object> list() {
        Map<String, Object> resp = new HashMap<>();
        List<Announcement> list = announcementRepository.findAllByOrderByDatePostedDesc();
        resp.put("success", true);
        resp.put("announcements", list);
        return resp;
    }

    @PostMapping("")
    public Map<String, Object> create(@RequestBody Map<String, String> payload) {
        Map<String, Object> resp = new HashMap<>();
        try {
            Announcement a = new Announcement();
            a.setTitle(payload.getOrDefault("title", ""));
            a.setMessage(payload.getOrDefault("message", ""));
            a.setAudience(payload.getOrDefault("audience", "All Donors"));
            a.setPriority(payload.getOrDefault("priority", "Normal"));
            a.setAdminName(payload.getOrDefault("author", "Administrator"));
            a.setDatePosted(LocalDateTime.now());
            Announcement saved = announcementRepository.save(a);
            resp.put("success", true);
            resp.put("announcement", saved);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
        }
        return resp;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        Map<String, Object> resp = new HashMap<>();
        try {
            announcementRepository.deleteById(id);
            resp.put("success", true);
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("message", e.getMessage());
        }
        return resp;
    }
}
