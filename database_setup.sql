USE project2;

-- Drop existing donations table if you want to recreate it (WARNING: This deletes all data)
-- DROP TABLE IF EXISTS donation_history;
-- DROP TABLE IF EXISTS donations;

-- Users table (keep as is)
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) NOT NULL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin table (keep as is)
CREATE TABLE IF NOT EXISTS admin (
    admin_name VARCHAR(50) NOT NULL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Updated Donations table to match Donation entity
CREATE TABLE IF NOT EXISTS donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    donation_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Donation history table (keep as is)
CREATE TABLE IF NOT EXISTS donation_history (
    username VARCHAR(50) NOT NULL,
    old_amount DECIMAL(10,2),
    new_amount DECIMAL(10,2),
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    remarks VARCHAR(255),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Announcements table (keep as is)
CREATE TABLE IF NOT EXISTS announcements (
    admin_name VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_name) REFERENCES admin(admin_name) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (username, email, password)
VALUES 
('leandro', 'leandro@example.com', 'pass123'),
('jed', 'jed@example.com', 'jedpass'),
('marko', 'marko@example.com', 'markopass'),
('john', 'john@example.com', 'johnpass'),
('janrey', 'janrey@example.com', 'janreypass')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample admins
INSERT INTO admin (admin_name, email, password)
VALUES
('admin_leandro', 'leandro_admin@example.com', 'admin123'),
('admin_jed', 'jed_admin@example.com', 'adminpass')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample donations (updated to match new structure)
INSERT INTO donations (username, full_name, email, donation_type, amount, message, status)
VALUES
('leandro', 'Leandro User', 'leandro@example.com', 'Cash', 1000.00, 'For school charity', 'APPROVED'),
('jed', 'Jed User', 'jed@example.com', 'Cash', 750.00, 'Community event support', 'APPROVED'),
('marko', 'Marko User', 'marko@example.com', 'Goods', 500.00, 'Medical donation', 'PENDING'),
('john', 'John User', 'john@example.com', 'Cash', 1200.00, 'Typhoon relief fund', 'APPROVED'),
('janrey', 'Janrey User', 'janrey@example.com', 'Food', 300.00, 'Local youth program', 'PENDING')
ON DUPLICATE KEY UPDATE amount=amount;

-- Insert donation history
INSERT INTO donation_history (username, old_amount, new_amount, action_type, remarks)
VALUES
('leandro', NULL, 1000.00, 'INSERT', 'Initial donation'),
('jed', NULL, 750.00, 'INSERT', 'Initial donation'),
('marko', NULL, 500.00, 'INSERT', 'Initial donation'),
('john', 1000.00, 1200.00, 'UPDATE', 'Increased donation'),
('janrey', NULL, 300.00, 'INSERT', 'First donation')
ON DUPLICATE KEY UPDATE remarks=remarks;

-- Insert announcements
INSERT INTO announcements (admin_name, title, message)
VALUES
('admin_leandro', 'New Donation Drive', 'Join our charity event this coming Saturday!'),
('admin_jed', 'Thank You Donors', 'Your generosity helps support our community projects.')
ON DUPLICATE KEY UPDATE message=message;

