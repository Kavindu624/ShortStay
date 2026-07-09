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

## 🚀 Installation Guide

Follow these steps to run the ShortStay system on a new computer.

### 1. Prerequisites

- **Node.js** (v18+ recommended)
- **MySQL Server** and a tool like **MySQL Workbench**

### 2. Extract the Project

Extract the provided `shortstay.zip` file to your desired directory and open the `shortstay` folder in your terminal or Visual Studio Code.

### 3. Database Setup

1. Open MySQL Workbench.
2. Create a new database schema named `shortstay`.
3. Import the database structure and sample data:
   - Go to **Server** -> **Data Import**.
   - Select **Import from Self-Contained File** and choose the `Files/ShortstayNew.sql` file located inside the project directory.
   - Select the `shortstay` schema as the Default Target Schema.
   - Click **Start Import**.

### 4. Configure Environment Variables

Since the `.env` files are already provided, ensure they are placed correctly:
- The backend configuration file should be at `backend/.env`
- The frontend configuration file should be at `frontend/.env`

*(Note: Ensure your local MySQL password matches the `DB_PASS` value in the `backend/.env` file. If your local MySQL password is different, update the `DB_PASS` value to match yours.)*

### 5. Install Dependencies

You need to install the Node.js packages for both the backend and frontend.

Open two separate terminals.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
```

### 6. Start the Application

Once the installations are complete, start both servers.

**Terminal 1 (Backend):**
```bash
npm run dev
```
*(The backend API will run on http://localhost:5000)*

**Terminal 2 (Frontend):**
```bash
npm run dev
```
*(The frontend application will run on http://localhost:5173)*

### 7. Access the System

Open your web browser and go to `http://localhost:5173`. You can now use the ShortStay system!

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

## 📖 Detailed User Manual & Test Credentials

This section provides comprehensive, step-by-step instructions for operating the ShortStay system across all user roles. 

### System Access & Test Credentials

You can access the system at `http://localhost:5173`. 
The following test accounts have been pre-configured for staff roles. *(All test accounts use the password: **password123**)*

*   **Admin Dashboard:** `admin@shortstay.com`
*   **Accountant (Payment Manager):** `pm@shortstay.com`
*   **Verifier (Field Inspector):** `inspector@shortstay.com`

---

### 1. Guest Operations
Guests use the platform to search, book, and review short-term accommodations.

**1.1 Account Registration & Login**
*   **Registration:** Click the "Sign Up" button on the top right. Fill in your name, email, phone number, and password. Select "Guest" as your role.
*   **Login:** Click "Login" and enter your credentials. You will be redirected to the Guest dashboard.

**1.2 Searching & Filtering Properties**
*   Navigate to the **"Browse Listings"** tab.
*   Use the search bar to look for specific cities or property names.
*   Click **"More Filters"** to filter by Price Range, Amenities (e.g., Free WiFi, Pool), Bedrooms, and Property Type (Villa, Apartment, etc.).
*   Click on any property card to view high-resolution images, full descriptions, and host details.

**1.3 Booking an Accommodation**
*   On the Property Details page, select your desired **Check-in** and **Check-out** dates from the calendar.
*   The system will automatically calculate the total price based on the number of nights. It will prevent you from selecting dates that are already booked.
*   Click **"Book Now"** to reserve the dates.

**1.4 Making a Secure Payment**
*   After booking, navigate to the **"Wallet / Payments"** tab or follow the prompt to pay.
*   Enter your credit card details into the secure Stripe checkout form. (For testing, use standard Stripe test cards like `4242 4242 4242 4242`).
*   Upon success, your booking status will change to "Confirmed".

**1.5 Managing Bookings & Reviews**
*   Go to **"My Bookings"** to view upcoming and past trips. You can cancel pending bookings here.
*   After a stay is completed, go to the **"Reviews"** tab to leave a 1-5 star rating and a written review for the property.

---

### 2. Host Operations
Hosts list their properties, manage availability, and earn revenue.

**2.1 Creating a Property Listing**
*   Log in as a Host and navigate to **"My Listings"**.
*   Click **"Add Property"**. Fill out the title, description, location, and price per night.
*   Upload up to 5 images showcasing the property.
*   Submit the property. It will initially be in an "Unverified" or "Pending" state until approved by a Verifier and Admin.

**2.2 Managing Availability**
*   Navigate to the **"Availability"** or Calendar tab.
*   Select your property from the dropdown.
*   You can manually block out dates (e.g., for maintenance or personal use) by clicking on the calendar days.

**2.3 Property Verification**
*   To get the "Verified" badge (which increases guest trust), click the **"Request Verification"** button on your listing.
*   This alerts the Field Inspector to review your property.

**2.4 Managing Bookings & Earnings**
*   **Bookings:** View all incoming guest requests. You can see guest details and booking statuses (Pending, Confirmed, Cancelled).
*   **Earnings Dashboard:** Track your financial performance. The dashboard displays Gross Earnings, the Platform Commission deducted, and your Net Payouts, complete with visual charts.

---

### 3. Administrator Operations
Admins ensure the smooth and secure operation of the entire marketplace.

**3.1 User Management**
*   Log in as Admin (`admin@shortstay.com`). Navigate to **"User Management"**.
*   View all registered users. You can temporarily **Suspend** users who violate terms or reactivate them.

**3.2 Property Moderation**
*   Navigate to **"Property Management"**.
*   Review newly submitted properties. Admins have the final authority to **Approve** or **Reject** listings to maintain platform quality.
*   Admins can instantly unlist properties if severe issues arise.

**3.3 Complaint Handling**
*   Navigate to **"Complaints"**.
*   View issues raised by guests or hosts. Update the status of complaints (Open, In Progress, Resolved) and add internal resolution notes.

---

### 4. Accountant (Payment Manager) Operations
Accountants monitor the financial health and transaction integrity of the platform.

**4.1 Transaction Monitoring**
*   Log in as Accountant (`pm@shortstay.com`) and open the **"Payment Dashboard"**.
*   View a real-time ledger of all guest payments, including Stripe Transaction IDs, amounts, and dates.

**4.2 Revenue Tracking**
*   The dashboard automatically calculates the Total Platform Gross, Total Commission Earned (based on the fixed platform fee percentage), and Total Paid Out to Hosts.

**4.3 Handling Refunds**
*   If a guest cancels a booking within the allowable window, the Accountant can track the cancellation and manually initiate or confirm the refund process through the dashboard.

---

### 5. Verifier (Field Inspector) Operations
Verifiers perform physical or virtual inspections to ensure property quality.

**5.1 Inspection Queue**
*   Log in as Verifier (`inspector@shortstay.com`).
*   The dashboard displays a queue of all properties that hosts have submitted for verification.

**5.2 Submitting Inspection Reports**
*   Click on a pending property to begin the inspection workflow.
*   Enter an **Overall Score** (0-100) based on cleanliness, accuracy of the listing, and safety.
*   Provide detailed written **Recommendations** or notes.
*   Submit the final decision to **Approve** or **Reject** the property. Approved properties receive a public "Verified" badge.
