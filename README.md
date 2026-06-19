🏡 ShortStay – Online Marketplace for Short-Term Accommodations

A modern web-based accommodation marketplace that connects guests with hosts for short-term property rentals. ShortStay simplifies property discovery, booking management, payment processing, and property verification through a secure role-based platform.

📌 Project Overview

ShortStay is a full-stack web application developed to provide a reliable and user-friendly accommodation booking experience for travelers while enabling property owners to manage and monetize their listings efficiently.

The platform supports multiple user roles including Guests, Hosts, Administrators, Payment Managers, and Field Inspectors to ensure smooth platform operations and trust between users.

✨ Key Features
🔐 Authentication & Authorization
Secure user registration and login
JWT-based authentication
Role-Based Access Control (RBAC)
Profile management
🏠 Property Management
Create and manage property listings
Upload property details and images
Property verification workflow
Availability management
🔍 Search & Filtering
Search properties by location
Filter by price range
Availability filtering
Rating-based search
📅 Booking Management
Real-time booking system
Reservation tracking
Booking history
Cancellation management
💳 Payment System
Online payment integration
Transaction monitoring
Refund processing
Payment tracking
⭐ Reviews & Ratings
User-generated reviews
Property ratings
Feedback management
📊 Administrative Functions
User management
Property approval workflow
Complaint handling
Platform monitoring and reporting
👥 User Roles
Role	Responsibilities
Guest	Search, book, review accommodations
Host	Manage properties and bookings
Admin	Manage users and platform operations
Payment Manager	Handle transactions and refunds
Field Inspector	Verify listed properties

🛠️ Tech Stack
Frontend
React.js
HTML5
CSS3
JavaScript (ES6+)
Backend
Node.js
Express.js
REST APIs
JWT Authentication
Database
MySQL
MySQL Workbench
Third-Party Services
PayHere / Stripe
Google Maps API
Nodemailer / Email API
Development Tools
Git & GitHub
Visual Studio Code
Postman
Figma

🏗️ System Architecture
React Frontend
      │
      ▼
REST API Layer
(Node.js + Express.js)
      │
      ▼
MySQL Database
      │
      ▼
External Services
├── Payment Gateway
├── Google Maps API
└── Email Notification Service
📂 Core Modules
Guest Module
Property Search
Booking Management
Online Payments
Reviews & Ratings
Booking History
Host Module
Property Listings
Booking Requests
Availability Calendar
Earnings Tracking
Admin Module
User Management
Property Approval
Complaint Resolution
Analytics Dashboard
Payment Module
Transaction Processing
Refund Management
Financial Reporting
Verification Module
Property Inspection
Verification Reports
Approval Workflow
🚀 Installation
Clone Repository
git clone https://github.com/yourusername/shortstay.git
cd shortstay
Install Frontend Dependencies
cd frontend
npm install
npm start
Install Backend Dependencies
cd backend
npm install
npm run dev
Configure Environment Variables

Create a .env file:

PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=shortstay

JWT_SECRET=your_secret_key

PAYHERE_API_KEY=your_api_key
GOOGLE_MAPS_API_KEY=your_api_key
EMAIL_API_KEY=your_api_key
📸 Screens Included
Homepage
Login & Registration
Property Search & Filtering
Property Details
Guest Dashboard
Host Dashboard
Booking Management
Admin Dashboard

🔒 Security Features
JWT Authentication
Password Encryption
Role-Based Access Control
Secure API Access
HTTPS Support
Input Validation
🧪 Testing

The application follows multiple testing strategies:

Unit Testing
Integration Testing
System Testing
User Acceptance Testing (UAT)
Performance Testing

Testing Tools:

Postman
Browser Developer Tools
Manual Testing

📈 Future Enhancements
Real-time messaging between guests and hosts
AI-powered accommodation recommendations
Mobile application support
Advanced analytics dashboard
Multi-language support
Enhanced fraud detection
Cloud deployment and scalability improvements
