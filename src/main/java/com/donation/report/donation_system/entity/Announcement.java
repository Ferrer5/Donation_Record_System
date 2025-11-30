package com.donation.report.donation_system.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_name")
    private String adminName;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String audience;

    private String priority;

    @Column(name = "date_posted")
    private LocalDateTime datePosted;

    public Announcement() {}

    @PrePersist
    public void prePersist() {
        if (datePosted == null) {
            datePosted = LocalDateTime.now();
        }
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDateTime getDatePosted() { return datePosted; }
    public void setDatePosted(LocalDateTime datePosted) { this.datePosted = datePosted; }
}
