-- HostelMate Database Schema

CREATE DATABASE IF NOT EXISTS hostelmate_db;
USE hostelmate_db;

-- -------------
-- CREATE TABLES
-- -------------

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'owner', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hostels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('Boys', 'Girls') NOT NULL,
  amenities JSON,
  total_rooms INT,
  available_rooms INT,
  image_url VARCHAR(255),
  is_approved BOOLEAN DEFAULT false,
  avg_rating DECIMAL(2,1) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS room_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hostel_id INT NOT NULL,
  type_name VARCHAR(255) NOT NULL,
  sharing INT NOT NULL,
  price_per_month DECIMAL(10,2) NOT NULL,
  available_count INT NOT NULL,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  hostel_id INT NOT NULL,
  room_type_id INT NOT NULL,
  start_date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  hostel_id INT NOT NULL,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paypal_order_id VARCHAR(255),
  status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  next_due_date DATE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  hostel_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  hostel_id INT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- -------------
-- INSERT DATA
-- -------------

-- Users Data
-- Admin: admin123 ($2b$10$sOfeicOIf5eCeKECV6s6IO9mwbVmQrsuEAUgD1veTCEl2vmrY9URS)
-- Owner: owner123 ($2b$10$D3Pf4BndfI8hv6IIC0zB2eEiuBRwN7H7MPs9Jnp8d39h11inLKuhq)
-- Student: student123 ($2b$10$SHEaIO6YnaFPq6q43HXegulRBE.oKDihtUCi7xtInWD6RjtByDqG6)
INSERT INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@hostelmate.com', '$2b$10$sOfeicOIf5eCeKECV6s6IO9mwbVmQrsuEAUgD1veTCEl2vmrY9URS', 'admin'),
('Raghavendra Rao', 'owner1@hostelmate.com', '$2b$10$D3Pf4BndfI8hv6IIC0zB2eEiuBRwN7H7MPs9Jnp8d39h11inLKuhq', 'owner'),
('Srinivas Reddy', 'owner2@hostelmate.com', '$2b$10$D3Pf4BndfI8hv6IIC0zB2eEiuBRwN7H7MPs9Jnp8d39h11inLKuhq', 'owner'),
('Lakshmi Narayanan', 'owner3@hostelmate.com', '$2b$10$D3Pf4BndfI8hv6IIC0zB2eEiuBRwN7H7MPs9Jnp8d39h11inLKuhq', 'owner'),
('Ananya Iyer', 'owner4@hostelmate.com', '$2b$10$D3Pf4BndfI8hv6IIC0zB2eEiuBRwN7H7MPs9Jnp8d39h11inLKuhq', 'owner'),
('Kavya Nair', 'owner5@hostelmate.com', '$2b$10$D3Pf4BndfI8hv6IIC0zB2eEiuBRwN7H7MPs9Jnp8d39h11inLKuhq', 'owner'),
('Rajat Sharma', 'student1@gmail.com', '$2b$10$SHEaIO6YnaFPq6q43HXegulRBE.oKDihtUCi7xtInWD6RjtByDqG6', 'student'),
('Aman Verma', 'student2@gmail.com', '$2b$10$SHEaIO6YnaFPq6q43HXegulRBE.oKDihtUCi7xtInWD6RjtByDqG6', 'student'),
('Priya Kapoor', 'student3@gmail.com', '$2b$10$SHEaIO6YnaFPq6q43HXegulRBE.oKDihtUCi7xtInWD6RjtByDqG6', 'student');

-- Hostels Data
INSERT INTO hostels (owner_id, name, location, description, type, amenities, total_rooms, available_rooms, image_url, is_approved, avg_rating) VALUES
(2, 'Lotus Girls Hostel', 'Medchal', 'A premium girls hostel with all essential amenities.', 'Girls', '["WiFi", "Food Included", "CCTV Security", "24/7 Water", "Power Backup"]', 50, 20, 'https://img.cofynd.com/images/latest_images_2024/eaf3bc01276928dd780d0f46c29c5db6730779d1.webp', true, 4.5),
(3, 'Green Nest PG', 'Medchal', 'Safe and secure ladies hostel featuring AC rooms.', 'Girls', '["WiFi", "Laundry", "AC Rooms", "Study Area", "Parking"]', 40, 15, 'https://content.jdmagicbox.com/v2/comp/hyderabad/z3/040pxx40.xx40.181220235454.k3z3/catalogue/sai-satwika-womems-pg-accommodation-gachibowli-hyderabad-paying-guest-accommodations-p2a9k4lwp7.jpg', true, 4.2),
(4, 'Sunrise Boys Hostel', 'Medchal', 'A spacious boys hostel with affordable rooms.', 'Boys', '["WiFi", "Food Included", "CCTV Security", "Power Backup", "Parking"]', 60, 30, 'https://content.jdmagicbox.com/v2/comp/rangareddy/b5/040pxx40.xx40.250813131417.n2b5/catalogue/pullareddy-boy-s-hostel-tukkuguda-rangareddy-hostels-for-men-2qnmc7hb8y.jpg', true, 4.0),
(5, 'Sri Sai Residency', 'Medchal', 'Comfortable student living with excellent transport links.', 'Boys', '["WiFi", "Laundry", "AC Rooms", "CCTV Security", "Study Area"]', 55, 25, 'https://content.jdmagicbox.com/v2/comp/hyderabad/v6/040pxx40.xx40.191217124657.m4v6/catalogue/lakshmi-pranathi-ladies-hostel-dilsukh-nagar-hyderabad-hostels-o9c0wf7y5x-250.jpg', true, 4.2),
(2, 'Shanti Student Homes', 'Kandlakoya', 'Peaceful and well-maintained girls accommodation.', 'Girls', '["WiFi", "Food Included", "24/7 Water", "CCTV Security"]', 40, 10, 'https://img.cofynd.com/images/original/7b5d48416069cf5e99bba291822467a86febdb43.jpg', true, 4.3),
(3, 'Gokul Residency', 'Kandlakoya', 'Close to college campus with focus on study environment.', 'Boys', '["WiFi", "AC Rooms", "Study Area", "Laundry", "Power Backup"]', 45, 12, 'https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_auto,w_600/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1661498913/Website/CMS-Uploads/gbxucdcgfafkqu0moeny.jpg', true, 4.1),
(4, 'Annapurna Paying Guest', 'Kompally', 'Modern living spaces for girls with luxury facilities.', 'Girls', '["WiFi", "Food Included", "AC Rooms", "Laundry", "CCTV Security"]', 35, 18, 'https://img.staticmb.com/mbphoto/pg/grd1/cropped_images/2020/Feb/07/Photo_h400_w540/GR1-5582-129141_400_540.jpg', true, 4.7),
(5, 'Maple Student Stay', 'Kompally', 'Secured and well furnished rooms for college students.', 'Boys', '["WiFi", "Parking", "Power Backup", "CCTV Security", "24/7 Water"]', 50, 20, 'https://imagecdn.99acres.com/media1/29561/13/591233553M-1755706856735.jpg', true, 3.9);

-- Room Types Data
INSERT INTO room_types (hostel_id, type_name, sharing, price_per_month, available_count) VALUES
-- Lotus (1)
(1, 'Eco Stay (4 Sharing)', 4, 5500.00, 10), (1, 'Classic (3 Sharing)', 3, 6500.00, 8), (1, 'Premium (2 Sharing)', 2, 7500.00, 5), (1, 'Single Deluxe', 1, 9500.00, 2),
-- Green Nest (2)
(2, 'Budget (4 Sharing)', 4, 5200.00, 8), (2, 'Standard (2 Sharing)', 2, 7200.00, 6), (2, 'Single Room', 1, 9000.00, 2),
-- Sunrise (3)
(3, 'Quad Sharing', 4, 5000.00, 12), (3, 'Triple Sharing', 3, 6000.00, 10), (3, 'Double Sharing', 2, 7000.00, 8), (3, 'Single Room', 1, 8500.00, 4),
-- Sri Sai (4)
(4, 'Standard Sharing', 3, 6200.00, 15), (4, 'Executive Double', 2, 7500.00, 10), (4, 'Elite Single', 1, 10000.00, 5),
-- Shanti (5)
(5, 'Basic Triple', 3, 5800.00, 5), (5, 'Comfort Double', 2, 6800.00, 4), (5, 'Premium Single', 1, 8800.00, 2),
-- Gokul (6)
(6, 'Triple Sharing', 3, 6000.00, 8), (6, 'Double Sharing', 2, 7200.00, 6), (6, 'Single Room', 1, 9200.00, 2),
-- Annapurna (7)
(7, 'Shared Haven', 3, 6500.00, 10), (7, 'Private Room', 1, 9500.00, 5),
-- Maple (8)
(8, 'Standard Triple', 3, 6000.00, 10), (8, 'Comfort Double', 2, 7500.00, 8), (8, 'Solo Suite', 1, 11000.00, 4);

-- Reviews Data
INSERT INTO reviews (student_id, hostel_id, rating, comment, is_anonymous, is_verified) VALUES
(8, 3, 4, 'Food is decent, worth the price.', true, true),
(9, 3, 3, 'Sometimes water issue, mostly good.', false, true),
(7, 4, 5, 'Best hostel in Medchal area. AC rooms are large.', true, true),
(8, 4, 4, 'Good laundry service. WiFi is fast enough.', false, true),
(9, 4, 5, 'Security is tight, feeling very safe.', true, true),
(7, 5, 4, 'Peaceful and close to Kandlakoya.', false, true),
(8, 5, 4, 'Food is home-like. Enjoying my stay.', true, true),
(9, 5, 5, 'Everything is perfect. Worth the rent.', false, true),
(7, 6, 3, 'Laundry takes time, rest is fine.', true, true),
(8, 6, 4, 'Ac rooms are nice. Study area is decent.', false, true),
(9, 6, 5, 'Good facilities overall.', false, true),
(7, 7, 5, 'Excellent stay! Highly luxury facilities.', true, true),
(8, 7, 4, 'A bit pricey but very good maintenance.', false, true),
(9, 7, 5, 'Food is great here.', false, true),
(7, 8, 4, 'Parking is huge. Rooms are good.', false, true),
(8, 8, 3, 'Water is there but power backup takes time sometimes.', true, true),
(9, 8, 4, 'Nice rooms and good place overall.', false, true);

-- Messages Data
INSERT INTO messages (sender_id, receiver_id, hostel_id, message) VALUES
(7, 2, 1, 'Hi, I would like to book a 2 sharing room. Is it available?'),
(2, 7, 1, 'Hello Student One, yes it is available. You can proceed with booking.'),
(8, 3, 2, 'Do you have AC rooms vacant right now?'),
(3, 8, 2, 'Yes, we have 4 AC rooms in 2 sharing vacant.'),
(9, 4, 3, 'Is food included in the 4200 rent?'),
(4, 9, 3, 'Yes, standard food is included.');
