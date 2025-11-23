package com.donation.report.donation_system.repository;

import com.donation.report.donation_system.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, String> {
    Admin findByAdminName(String adminName);
    Admin findByEmail(String email);
}

