USE project2;

-- Create a system user for admin-added donation records
-- This user is used when admin adds records for donors who don't have accounts
INSERT INTO users (username, email, password)
VALUES ('admin_system', 'system@donation.local', 'system_user_2025')
ON DUPLICATE KEY UPDATE email = VALUES(email);

