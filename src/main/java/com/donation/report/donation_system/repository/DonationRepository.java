package com.donation.report.donation_system.repository;

import com.donation.report.donation_system.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByUsernameOrderByCreatedAtDesc(String username);
    List<Donation> findByStatusOrderByCreatedAtDesc(String status);
    List<Donation> findAllByOrderByCreatedAtDesc();
}

