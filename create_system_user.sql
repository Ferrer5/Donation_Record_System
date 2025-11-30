USE project2;

INSERT INTO users (username, email, password)
VALUES ('admin_system', 'system@donation.local', 'system_user_2025')
ON DUPLICATE KEY UPDATE email = VALUES(email);

