# HostelMate

HostelMate is a web platform designed to help students discover hostels near selected colleges. The platform allows users to explore hostel listings and view ratings and reviews submitted by verified students.

This project is a clean, full-stack application built using Node.js, Express, MySQL, and vanilla frontend technologies (HTML/CSS/JS).

---

## Features

- **Discover Hostels**: Browse and filter hostels near selected colleges by price and rating.
- **Verified Reviews**: View and post hostel ratings and reviews. Only verified students can post reviews.
- **Anonymous Posting**: Reviews can be posted anonymously while ensuring the reviewer is verified.
- **Student Authentication**: Secure registration and login with student ID card uploads for verification.
- **Admin Dashboard**: Dedicated view for administrators to verify student accounts and manage users.

---

## Tech Stack

**Backend**
- Node.js & Express.js
- JWT (JSON Web Token) for authentication
- Multer for file uploads (ID cards)

**Database**
- MySQL (with `mysql2` driver)

**Frontend**
- HTML5
- Vanilla CSS
- Vanilla JavaScript (Fetch API)

---

## Project Structure

```
HostelMate
├── backend
│   ├── controllers     # logic for auth, admin, and hostels
│   ├── db              # database connection and schema.sql
│   ├── middleware      # authentication guards
│   └── routes          # API endpoint definitions
├── frontend
│   ├── css             # styles
│   ├── js              # client-side logic
│   └── *.html          # UI pages
├── uploads             # student ID images
├── server.js           # entry point
├── .env                
└── README.md
```

---

## How to Run the Project

1. **Clone the repository**
   ```bash
   git clone https://github.com/chitraprabhu/HostelMate.git
   ```

   ```bash   
   cd HostelMate
   ```

2. **Install dependencies**
   In the root directory, run:
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a MySQL database named `hostelmate`.
   - Run the SQL script found in `backend/db/schema.sql` to initialize tables and seed sample data.

4. **Configure Environment**
   - Copy the `.env.example` file and rename it to `.env`.
   - Update the values in the `.env` file with your local MySQL credentials:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=hostelmate
   JWT_SECRET=your_jwt_secret
   ```

5. **Start the Application**
   ```bash
   npm start
   ```
   Or for development mode:
   ```bash
   npm run dev
   ```
   Visit **http://localhost:5000** in your browser.

---

## Sample Accounts

- **Admin**: `admin@hostelmate.com` | `admin123`
- **Verified Student**: `student1@example.com` | `admin123`

---

## Limitations & Future Improvements

- **Limitations**: The project is currently in a development stage with basic UI/UX and limited college, hostel data.
- **Future Improvements**:
    - Implement more robust data validation.
    - Add advanced hostel amenities and location maps.
    - Enhance UI with more interactive components.
    - Add automated testing suites.
