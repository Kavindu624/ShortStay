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

- User Registration & Authentication (email/password and Google OAuth)
- Role-Based Access Control (5 roles)
- Property Listing Management with multi-image upload
- Advanced Search & Filtering
- Booking Management with automatic 24-hour host-response expiry
- Concurrency-safe booking (prevents two guests double-booking the same dates)
- Online Payment Processing via Stripe
- Guest Membership Tiers with automatic payment discounts
- Review & Rating System (with host responses)
- Property Verification Process (field inspection workflow)
- In-App & Email Notification System
- Administrative Dashboard with reporting & analytics
- Host Earnings & Payout Management

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
- Earn membership tier upgrades (Basic → Silver → Gold → Platinum) based on completed stays, unlocking payment discounts

### Host

- Create and manage property listings
- Upload property information and images
- Manage booking requests (approve/reject/complete)
- Update availability calendars
- View earnings and payout history
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

- React (Vite)
- Recharts (dashboards & analytics charts)
- Axios (API client)

### Backend

- Node.js
- Express.js
- Sequelize ORM
- JWT Authentication
- Passport.js (Google OAuth 2.0)
- Socket.IO (real-time infrastructure — see [Notes on Current Implementation Status](#-notes-on-current-implementation-status))

### Database

- MySQL
- MySQL Workbench

### Third-Party Services

- Stripe (payment processing)
- Google OAuth 2.0 (social login)
- Nodemailer (transactional email via SMTP)

### Development Tools

- Git & GitHub
- GitHub Actions (CI pipeline — lint, build, and dependency audit run automatically on push/PR)
- Visual Studio Code
- Postman
- Figma

---

## 🏗️ System Architecture

The system follows a **3-tier architecture**:

```text
Presentation Tier          Application/Logic Tier         Data Tier
(React + Vite)      ──▶    (Node.js + Express API)  ──▶   (MySQL via Sequelize ORM)
                                    │
                     ┌──────────────┼───────────────┐
                     ▼              ▼                ▼
                  Stripe        Nodemailer      Google OAuth
                (Payments)       (Email)           (Login)
```

Within the Application/Logic tier, requests flow through **routes** (URL → handler mapping) → **middleware** (authentication, role checks, validation) → **controllers** (business logic) → **models** (Sequelize definitions of the MySQL schema).

---

## 📂 Project Modules

### User Management
- Registration, Login & Authentication (local + Google OAuth)
- Profile Management
- Role Management

### Property Management
- Property Listings & Image Uploads
- Availability Management (per-date calendar)
- Property Verification (inspector workflow)

### Booking Management
- Search & Filtering
- Reservation System (transactional, concurrency-safe date claiming)
- Automatic Booking Expiry (24h host response window, checked every 15 minutes)
- Booking Confirmation & History

### Payment Management
- Online Payments via Stripe
- Membership-tier discounts (0–3% based on guest tier)
- Refund Processing
- Transaction Tracking & Financial Reporting

### Review System
- Ratings & Reviews
- Host Responses to Reviews

---

## 🔒 Security Features

- JWT-based Authentication, with server-side token invalidation on logout/password change
- Password hashing with bcrypt
- Role-Based Access Control (RBAC) via route-level middleware
- Rate limiting on authentication endpoints
- CORS restricted to configured frontend origins and local network IPs (for mobile testing)
- File upload validation (extension + MIME type checks)
- Input validation & sanitization (including CSV export sanitization and HTML-escaping in email templates)

> This project underwent an internal security review during development; several vulnerability classes (OAuth account-hijacking, IDOR, path traversal, injection) were identified and patched. As with any academic project, this should not be treated as production-hardened without a fresh, independent review before any real deployment.

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

### Continuous Integration

A GitHub Actions workflow runs automatically on every push and pull request:
- **Backend:** syntax-checks every `.js` file and runs `npm audit`
- **Frontend:** runs ESLint, builds the production bundle, and runs `npm audit`

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

Copy `.env.example` (if provided) to `.env` in both `backend/` and `frontend/`, then fill in your own values:
- `backend/.env` needs your local MySQL credentials, a `JWT_SECRET`, Stripe test keys, Google OAuth credentials (if testing social login), and SMTP credentials for outgoing email.
- `frontend/.env` needs the backend API URL.

`.env` files are gitignored and **must never be committed** — they hold real secrets, not placeholder values.

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
- Login & Registration (including Google OAuth)
- Search & Filtering
- Property Details
- Guest Dashboard
- Host Dashboard
- Admin / Accountant / Verifier Dashboards
- Booking Management

---

## 📈 Future Enhancements

- Real-time messaging between guests and hosts
- AI-powered property recommendations
- Mobile application (Android & iOS)
- Multi-language support
- Enhanced fraud detection
- Cloud deployment and scaling
- Google Maps-based location search (the backend has an integration point ready for geocoded coordinates; the frontend does not yet call a geocoding API)

---

## 📝 Notes on Current Implementation Status

For transparency, a couple of pieces of infrastructure exist in the codebase but aren't fully wired end-to-end yet:

- **Real-time notification delivery:** the backend has a working Socket.IO server (`backend/utils/websocket.js`) that emits an event the instant a notification is created. The frontend does not yet open a WebSocket connection to receive it, so in-app notifications currently update via a regular page-load fetch rather than an instant push. The email notification for the same events is fully live.
- **Location search:** the backend's property search accepts geocoded `location_lat`/`location_lng` parameters (intended to come from the Google Maps Geocoding API), but the frontend does not yet call that API — location search currently works by text/address matching instead.

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

Pre-configured staff accounts exist for each internal role:

*   **Admin Dashboard:** `admin@shortstay.com`
*   **Accountant (Payment Manager):** `pm@shortstay.com`
*   **Verifier (Field Inspector):** `inspector@shortstay.com`

Passwords for these accounts are set locally in your own database and are not fixed/shared here — check with whoever manages your local `shortstay` MySQL instance, or use the "Forgot Password" flow to reset one.

---

### 1. Guest Operations
Guests use the platform to search, book, and review short-term accommodations.

**1.1 Account Registration & Login**
*   **Registration:** Click the "Sign Up" button on the top right. Fill in your name, email, phone number, and password, or use "Sign in with Google". Select "Guest" as your role.
*   **Login:** Click "Login" and enter your credentials, or continue with Google. You will be redirected to the Guest dashboard.

**1.2 Searching & Filtering Properties**
*   Navigate to the **"Browse Listings"** tab.
*   Use the search bar to look for specific cities or property names.
*   Click **"More Filters"** to filter by Price Range, Availability, Rating, and Property Type (Villa, Apartment, etc.).
*   Click on any property card to view images, full descriptions, and host details.

**1.3 Booking an Accommodation**
*   On the Property Details page, select your desired **Check-in** and **Check-out** dates from the calendar.
*   The system will automatically calculate the total price based on the number of nights. It will prevent you from selecting dates that are already booked.
*   Click **"Book Now"** to reserve the dates. The host has 24 hours to approve or reject the request before it automatically expires.

**1.4 Making a Secure Payment**
*   Once a host approves your booking, navigate to **"My Bookings"** and click **"Pay Now"**.
*   Enter your credit card details into the secure Stripe checkout form. (For testing, use standard Stripe test cards like `4242 4242 4242 4242`).
*   Upon success, your booking status will change to "Confirmed". Guests with a Silver/Gold/Platinum membership tier automatically receive a discount on this payment.

**1.5 Managing Bookings & Reviews**
*   Go to **"My Bookings"** to view upcoming and past trips. You can cancel pending/approved/confirmed bookings here (refund amount depends on how close to check-in you cancel).
*   After a stay is completed, go to the **"My Reviews"** tab to leave a 1-5 star rating and a written review for the property.

---

### 2. Host Operations
Hosts list their properties, manage availability, and earn revenue.

**2.1 Creating a Property Listing**
*   Log in as a Host and navigate to **"My Listings"**.
*   Click **"Add Property"**. Fill out the title, description, location, and price per night.
*   Upload images showcasing the property.
*   Submit the property. It will initially be in a "Pending Approval" state until approved by an Admin, and "Unverified" until a Verifier inspects it.

**2.2 Managing Availability**
*   Navigate to the **"Availability"** or Calendar tab.
*   Select your property from the dropdown.
*   You can manually mark dates as available or blocked by clicking on the calendar days.

**2.3 Property Verification**
*   To get the "Verified" badge (which increases guest trust), click the **"Request Verification"** button on your listing.
*   This adds your property to the Field Inspector's verification queue.

**2.4 Managing Bookings & Earnings**
*   **Bookings:** View all incoming guest requests. You can approve, reject, or mark a booking complete after checkout.
*   **Earnings:** Track your financial performance — Gross Earnings, the Platform Commission deducted, and your Net Payouts, with visual charts.

---

### 3. Administrator Operations
Admins ensure the smooth and secure operation of the entire marketplace.

**3.1 User Management**
*   Log in as Admin. Navigate to **"Users"**.
*   View all registered users. You can temporarily **Suspend** users who violate terms, or reactivate them (admins cannot suspend or delete their own account).

**3.2 Property Moderation**
*   Navigate to **"Properties"**.
*   Review newly submitted properties. Admins have the final authority to **Approve** or **Reject** listings to maintain platform quality.

**3.3 Complaint Handling**
*   Navigate to **"Complaints"**.
*   View issues raised by guests. Update the status of complaints (Open, In Progress, Resolved, Closed) and add internal resolution notes.

---

### 4. Accountant (Payment Manager) Operations
Accountants monitor the financial health and transaction integrity of the platform.

**4.1 Transaction Monitoring**
*   Log in as Accountant and open **"Payments"**.
*   View a ledger of all guest payments, including transaction IDs, amounts, and dates.

**4.2 Revenue Tracking**
*   **"Reports"** shows monthly revenue, real occupancy rates (based on actual booked vs. available property dates), and top-performing hosts.

**4.3 Managing Payouts**
*   **"Payouts"** lets the accountant generate a payout for a completed, paid booking and mark it as processed once the host has been paid, with commission automatically calculated from the platform's commission rate.

---

### 5. Verifier (Field Inspector) Operations
Verifiers perform physical or virtual inspections to ensure property quality.

**5.1 Inspection Queue**
*   Log in as Verifier.
*   **"Verification Queue"** displays properties that hosts have requested verification for; the verifier schedules and completes inspections from there.

**5.2 Submitting Inspection Reports**
*   Open a pending property to begin the inspection workflow.
*   Enter an **Overall Score** based on cleanliness, accuracy of the listing, and safety.
*   Provide written **Recommendations** or notes, and images from the inspection.
*   Submit the final decision to **Approve** or **Revoke** the property's verification badge.
