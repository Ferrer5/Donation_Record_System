CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) NOT NULL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin (
    admin_name VARCHAR(50) NOT NULL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    donation_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TYPE action_type_enum AS ENUM ('INSERT', 'UPDATE', 'DELETE');

CREATE TABLE IF NOT EXISTS donation_history (
    username VARCHAR(50) NOT NULL,
    old_amount DECIMAL(10,2),
    new_amount DECIMAL(10,2),
    action_type action_type_enum NOT NULL,
    remarks VARCHAR(255),
    action_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
    admin_name VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    date_posted TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_name) REFERENCES admin(admin_name) ON DELETE CASCADE
);

INSERT INTO users (username, email, password)
VALUES 
('leandro', 'leandro@example.com', 'pass123'),
('jed', 'jed@example.com', 'jedpass'),
('marko', 'marko@example.com', 'markopass'),
('john', 'john@example.com', 'johnpass'),
('janrey', 'janrey@example.com', 'janreypass')
ON CONFLICT (username) DO NOTHING;

INSERT INTO admin (admin_name, email, password)
VALUES
('admin_leandro', 'leandro_admin@example.com', 'admin123'),
('admin_jed', 'jed_admin@example.com', 'adminpass')
ON CONFLICT (admin_name) DO NOTHING;

INSERT INTO donations (username, full_name, email, donation_type, amount, message, status)
VALUES
('leandro', 'Leandro User', 'leandro@example.com', 'Cash', 1000.00, 'For school charity', 'APPROVED'),
('jed', 'Jed User', 'jed@example.com', 'Cash', 750.00, 'Community event support', 'APPROVED'),
('marko', 'Marko User', 'marko@example.com', 'Goods', 500.00, 'Medical donation', 'PENDING'),
('john', 'John User', 'john@example.com', 'Cash', 1200.00, 'Typhoon relief fund', 'APPROVED'),
('janrey', 'Janrey User', 'janrey@example.com', 'Food', 300.00, 'Local youth program', 'PENDING')
ON CONFLICT (id) DO NOTHING;

INSERT INTO donation_history (username, old_amount, new_amount, action_type, remarks)
VALUES
('leandro', NULL, 1000.00, 'INSERT', 'Initial donation'),
('jed', NULL, 750.00, 'INSERT', 'Initial donation'),
('marko', NULL, 500.00, 'INSERT', 'Initial donation'),
('john', 1000.00, 1200.00, 'UPDATE', 'Increased donation'),
('janrey', NULL, 300.00, 'INSERT', 'First donation');

INSERT INTO announcements (admin_name, title, message)
VALUES
('admin_leandro', 'New Donation Drive', 'Join our charity event this coming Saturday!'),
('admin_jed', 'Thank You Donors', 'Your generosity helps support our community projects.');

