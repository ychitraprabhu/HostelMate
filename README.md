# HostelMate

HostelMate is a web platform that helps students discover and book hostels at a selected location. The goal of the project is to simplify the process of finding accommodation by providing verified hostel listings, transparent pricing, and a straightforward booking and payment flow.

The platform also ensures that reviews come from students who have actually stayed in that hostel, making feedback more reliable.

Originally this project focused only on verified hostel reviews using student ID verification.

## Overview

HostelMate connects students and hostel owners through a simple web interface. Students can browse available hostels, view room types and prices, make bookings, and complete payments. Hostel owners can list properties and communicate with potential tenants. The system also includes role-based dashboards and an admin panel for managing listings.

## Tech Stack

Frontend  
HTML5, CSS3, and JavaScript (ES6)

Backend  
Node.js with Express.js

Database  
MySQL relational database

Authentication  
JWT (JSON Web Tokens) and bcrypt for password hashing

Payments  
PayPal Sandbox integration

Icons  
Lucide Icons

## Main Features

- Hostel search and filtering  
Students can browse hostels and filter listings by location, hostel type (boys or girls), and price range.

- Room selection and booking  
Each hostel provides multiple room types with different sharing options and prices.

- Payment integration  
Bookings can be completed using PayPal Sandbox for payment simulation.

- Verified reviews  
Students can leave ratings and reviews only if they have completed a booking and payment for that hostel.

- Messaging system  
Students can send messages directly to hostel owners for inquiries.

- Role-based dashboards  
Students can view bookings, payment status, and communicate with owners.  
Owners can manage hostels and view booking requests.  
Admins can approve or reject hostel listings, manage reviews and monitor platform activity.

## Project Structure

```
HostelMate
├── backend
│   ├── controllers     # logic for auth, admin, and hostels
│   ├── db              # database connection and schema.sql
│   ├── middleware      # authentication guards
│   ├── routes          # API endpoint definitions
│   └── server.js       
├── frontend
│   ├── css             # styles
│   ├── js              # client-side logic
│   └── *.html          # UI pages
├── .env                
└── README.md          
```

## Architecture

A full-stack application built using a Node.js backend with REST APIs, a HTML, CSS, and JavaScript frontend, and a relational database schema.

## Possible Improvements

- Additional request validation using libraries such as Joi or Express Validator.  
- Integration with mapping services such as Google Maps for property locations.  
- More dynamic amenity management for hostel listings.  
- Automated unit and integration tests.

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Database Setup
- Install **MySQL** and create a database named `hostelmate_db`.
- Import the schema and sample data:
  ```bash
  mysql -u root -p hostelmate_db < backend/db/schema.sql
  ```

### 2. Backend Configuration
- Navigate to the `backend` folder and install dependencies:
  ```bash
  cd backend
  npm install
  ```
- Copy the `.env.example` (or create a new `.env` file) and fill in your database credentials and JWT secret:
  ```env
  PORT=5000
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=yourpassword
  DB_NAME=hostelmate_db
  JWT_SECRET=your_jwt_secret
  PAYPAL_CLIENT_ID=your_paypal_client_id
  PAYPAL_CLIENT_SECRET=your_paypal_client_secret
  ```

### 3. Running the Server
- Start the server:
  ```bash
  npm start
  # or for development with auto-reload
  npm run dev
  ```
- The API will be running at `http://localhost:5000`.

