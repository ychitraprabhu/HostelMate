DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS hostels;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS colleges;

CREATE TABLE IF NOT EXISTS colleges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('student','admin') DEFAULT 'student',
    verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
    id_card_path VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hostels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_label VARCHAR(255) NOT NULL,
    college_id INT NOT NULL,
    description TEXT,
    price_per_month DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hostel_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- Delete existing
DELETE FROM reviews;
DELETE FROM hostels;
DELETE FROM users;
DELETE FROM colleges;


-- SAMPLE DATA
INSERT INTO colleges (name)
VALUES ('CMR Institute of Technology, Hyderabad');

INSERT INTO hostels (name, location_label, college_id, description, price_per_month) VALUES

('CMRIT Boys Campus Hostel', '0.2 km from College', 1, 'Official campus hostel for boys. Very strict rules.', 7500),
('CMRIT Girls Campus Hostel', '0.1 km from College', 1, 'Official campus hostel for girls. Highly secure.', 7500),

-- Boys PGs
('Sai Krupa Boys PG', '5.5 km from College', 1, 'Clean rooms, good food, and very student friendly.', 6500),
('Student Paradise Boys Hostel', '6.2 km from College', 1, 'Premium hostel with AC rooms and attached bathrooms.', 8500),
('Srinivasa Executive PG for Men', '7.0 km from College', 1, 'Affordable PG popular among students and working professionals.', 5000),
('Comfort Stay Boys PG', '5.8 km from College', 1, 'Spacious rooms and reliable WiFi suitable for students.', 6000),

-- Womens PGs
('Jyothi Womens Hostel', '5.1 km from College', 1, 'Safe womens hostel with decent WiFi and regular meals.', 5200),
('Sri Lakshmi Womens PG', '6.5 km from College', 1, 'Clean rooms with good security and home style food.', 5500),
('Annapurna Ladies Hostel', '7.5 km from College', 1, 'Affordable PG with basic facilities and calm environment.', 4800),
('Sree Durga Womens Residency', '8.2 km from College', 1, 'Well maintained rooms and quiet atmosphere for studying.', 6000),
('Sai Tejaswini Womens PG', '6.8 km from College', 1, 'Spacious rooms and secure building near student areas.', 5300);


-- USERS
INSERT INTO users (email, password_hash, full_name, role, verification_status) VALUES
('admin@hostelmate.com', '$2b$10$VXCQJFhY/kgdXJQN/vyIr.9P6kpFidt1U8waqUdAhuXbmaSfIysnC', 'System Admin', 'admin', 'verified'),
('student1@example.com', '$2b$10$VXCQJFhY/kgdXJQN/vyIr.9P6kpFidt1U8waqUdAhuXbmaSfIysnC', 'Rahul Sharma', 'student', 'verified'),
('student2@example.com', '$2b$10$VXCQJFhY/kgdXJQN/vyIr.9P6kpFidt1U8waqUdAhuXbmaSfIysnC', 'Neha Gupta', 'student', 'verified'),
('student3@example.com', '$2b$10$VXCQJFhY/kgdXJQN/vyIr.9P6kpFidt1U8waqUdAhuXbmaSfIysnC', 'Ananya Reddy', 'student', 'verified'),
('student4@example.com', '$2b$10$VXCQJFhY/kgdXJQN/vyIr.9P6kpFidt1U8waqUdAhuXbmaSfIysnC', 'Sneha Iyer', 'student', 'verified'),
('student5@example.com', '$2b$10$VXCQJFhY/kgdXJQN/vyIr.9P6kpFidt1U8waqUdAhuXbmaSfIysnC', 'Karthik Varma', 'student', 'verified'),
('student6@example.com', '$2b$10$VXCQJFhY/kgdXJQN/vyIr.9P6kpFidt1U8waqUdAhuXbmaSfIysnC', 'Priya Singh', 'student', 'verified');

-- REVIEWS
-- user_id offset depends on DB auto increment, but assuming sequential after reset
-- User 2 is student1@example.com to User 7
-- Hostel 1 is CMRIT Boys, Hostel 2 is CMRIT Girls, Hostel 3 is Sai Krupa
INSERT INTO reviews (user_id, hostel_id, rating, comment, is_anonymous) VALUES
(2, 3, 5, 'Clean rooms, timely meals, and the warden is very approachable. Highly recommended.', FALSE),
(3, 7, 4, 'Good location and decent WiFi. Mess food could be more consistent.', TRUE),
(2, 4, 5, 'Best AC hostel. Facilities are very good.', FALSE),
(4, 8, 5, 'Very safe womens PG and the food tastes like home.', FALSE),
(5, 9, 4, 'Affordable hostel and suitable for students on a budget.', FALSE),
(3, 10, 5, 'Rooms are spacious and the environment is quiet for studying.', FALSE),
(7, 11, 3, 'Decent place but the management is a bit slow to fix plumbing issues. WiFi is okay.', TRUE),
(4, 5, 4, 'Good PG for the price. WiFi works well most of the time.', FALSE),
(6, 6, 2, 'The rooms are quite cramped and the food quality has dropped recently. Not worth 6k honestly.', FALSE),
(5, 3, 3, 'Friendly environment but the washing machines are always busy during weekends. Overall average.', TRUE),
(2, 11, 2, 'Security is good but there are strict curfews that make it hard to do group projects late at college.', FALSE),
(4, 4, 4, 'Pricey, but you get what you pay for. AC is a lifesaver during summer. Sometimes there are power cuts though.', TRUE),
(6, 9, 1, 'Terrible experience! The food was sometimes stale and the rooms had a severe mosquito problem in the rainy season.', FALSE),
(2, 1, 4, 'Strict but good for peace of mind. Food is average campus fare.', FALSE),
(3, 2, 5, 'Very safe and close to classes. Highly recommend for freshers.', FALSE);
