# 🏠 ShortStay

### Online Marketplace for Short-Term Accommodations

ShortStay is a web-based accommodation marketplace that connects guests with hosts offering short-term rental properties. The platform provides a secure, user-friendly, and locally focused alternative for booking accommodations, while supporting property owners in generating income from their spaces.

---

## 📖 Overview

ShortStay is designed to simplify the process of finding, booking, and managing short-term accommodations. The system supports multiple user roles, secure online payments, property verification, and comprehensive booking management.

### Key Goals

- Provide a reliable accommodation booking platform
- Support local property owners and travelers
- Ensure trust through property verification
- Deliver a secure and user-friendly experience
- Streamline booking and payment processes

---

## ✨ Features

### Core Features

- User Registration & Authentication
- Role-Based Access Control
- Property Listing Management
- Advanced Search & Filtering
- Booking Management
- Online Payment Processing
- Review & Rating System
- Property Verification Process
- Notification System
- Administrative Dashboard
- Reporting & Analytics

---

## 👥 User Roles

### Guest

- Search accommodations
- Filter properties by location, price, availability, and ratings
- View property details
- Make bookings
- Complete online payments
- Manage booking history
- Submit reviews and ratings

### Host

- Create and manage property listings
- Upload property information and images
- Manage booking requests
- Update availability calendars
- View earnings and booking history
- Submit properties for verification

### Admin

- Manage users and listings
- Approve or reject properties
- Handle complaints and disputes
- Monitor system activity
- Generate reports

### Accountant

- Monitor transactions
- Process guest payments
- Manage host payouts
- Handle refunds and cancellations
- Generate financial reports

### Verifier

- Verify properties
- Conduct inspections
- Upload inspection reports
- Approve or reject property submissions
- Maintain inspection records

---

## 🛠️ Technology Stack

### Frontend

- React.js
- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- JWT Authentication

### Database

- MySQL
- MySQL Workbench

### Third-Party Services

- PayHere / Stripe
- Google Maps API
- SendGrid / NodeMailer

### Development Tools

- Git & GitHub
- Visual Studio Code
- Postman
- Figma

---

## 🏗️ System Architecture

```text
Frontend (React.js)
        │
        ▼
Backend API (Node.js + Express.js)
        │
        ▼
MySQL Database
        │
 ┌──────┼────────┐
 ▼      ▼        ▼
Payments Email  Maps
Gateway  API    API
```

---

## 📂 Project Modules

### User Management

- Registration
- Login & Authentication
- Profile Management
- Role Management

### Property Management

- Property Listings
- Image Uploads
- Availability Management
- Property Verification

### Booking Management

- Search & Filtering
- Reservation System
- Booking Confirmation
- Booking History

### Payment Management

- Online Payments
- Refund Processing
- Transaction Tracking
- Financial Reporting

### Review System

- Ratings
- Reviews
- User Feedback

---

## 🔒 Security Features

- JWT-based Authentication
- Role-Based Access Control (RBAC)
- Secure HTTPS Communication
- Protected API Endpoints
- Data Validation & Sanitization

---

## 🧪 Testing Strategy

The project follows multiple testing approaches:

- Unit Testing
- Integration Testing
- System Testing
- User Acceptance Testing (UAT)
- Performance Testing

### Testing Tools

- Postman
- Browser Developer Tools
- Manual Testing

---

## 🚀 Installation

### Prerequisites

- Node.js (v16+)
- MySQL Server
- Git

### Clone Repository

```bash
git clone https://github.com/Kavindu624/shortstay.git
cd shortstay
```

### Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

### Configure Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shortstay

JWT_SECRET=your_secret_key

PAYMENT_GATEWAY_KEY=your_payment_key
EMAIL_API_KEY=your_email_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### Start the Application

#### Backend

```bash
npm run dev
```

#### Frontend

```bash
npm start
```

---

## 📊 Non-Functional Requirements

- Supports 100+ concurrent users
- 99.5% uptime target
- Cross-browser compatibility
- Responsive design
- Maintainable and scalable architecture
- GDPR-compliant data handling

---

## 📸 UI Screens

- Home Page
- Login & Registration
- Search & Filtering
- Property Details
- Guest Dashboard
- Host Dashboard
- Booking Management

---

## 📈 Future Enhancements

- Real-time messaging between guests and hosts
- AI-powered property recommendations
- Mobile application (Android & iOS)
- Advanced analytics dashboard
- Multi-language support
- Enhanced fraud detection
- Cloud deployment and scaling

---

## 🤝 Contributors

| Role | Responsibility |
|--------|---------------|
| Project Manager | Project Planning & Coordination |
| System Analyst | Requirement Analysis |
| System Designer | System Architecture & UI Design |
| Database Administrator | Database Design |
| Frontend Developer | User Interface Development |
| Backend Developer | API & Business Logic Development |
| QA Tester | Testing & Quality Assurance |

---

## 📚 Academic Project

**Course:** CIS3012 – Group Project  
**Faculty:** Faculty of Computing  
**University:** University of Sri Jayewardenepura

---

## 📄 License

This project is developed for educational and academic purposes.

---

### 🌟 ShortStay – Making Short-Term Accommodation Booking Simple, Secure, and Accessible.
