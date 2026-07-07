# ShortStay Frontend

A full React frontend for the ShortStay short-term rental platform, matching the Figma design.

## Tech Stack
- **React 18** + **Vite**
- **React Router v6** – client-side routing
- **Axios** – API calls to the backend
- **Recharts** – dashboard charts
- **Lucide React** – icons

## Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Make sure your backend is running
```bash
# In your Backend folder:
node server.js
# Backend runs on http://localhost:5000
```

### 3. Start the frontend dev server
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Build for production
```bash
npm run build
```

## Pages & Routes

### Public
| Route | Page |
|-------|------|
| `/` | Home – property listings + marketing |
| `/about` | About ShortStay |
| `/property/:id` | Public property detail |
| `/access-portal` | Role selector (Host / Guest) |
| `/login` | Login |
| `/register` | Register |
| `/forgot-password` | Forgot password |

### Guest (role: `guest`)
| Route | Page |
|-------|------|
| `/guest/browse` | Browse all listings |
| `/guest/property/:id` | Property detail + booking |
| `/guest/bookings` | My bookings (cancel, pay, review) |
| `/guest/pay/:bookingId` | Payment / billing form |
| `/guest/wallet` | Wallet & transaction history |
| `/guest/reviews` | Write reviews |
| `/guest/settings` | Profile & password settings |

### Host (role: `host`)
| Route | Page |
|-------|------|
| `/host/listings` | My property listings |
| `/host/listings/new` | Create new property |
| `/host/listings/edit/:id` | Edit property |
| `/host/bookings` | View & approve bookings |
| `/host/reviews` | Guest reviews + host responses |
| `/host/earnings` | Earnings dashboard with chart |

### Admin (role: `admin`)
| Route | Page |
|-------|------|
| `/admin/dashboard` | Stats + charts overview |
| `/admin/users` | All users + create staff |
| `/admin/properties` | Approve/reject properties |
| `/admin/payments` | Payment overview |
| `/admin/reports` | Reports & analytics with charts |

### Verifier (role: `verifier`)
| Route | Page |
|-------|------|
| `/inspector/inspections` | View inspections + submit + approve badge |

### Accountant (role: `accountant`)
| Route | Page |
|-------|------|
| `/pm/dashboard` | Financial dashboard + transactions |
| `/pm/reports` | Reports & analytics |

## Design
- **Primary colour:** `#1e3a8a` (deep navy blue)
- **Accent:** `#10b981` (emerald green)
- **Font:** Inter
- Matches the Figma design with sidebar + top bar layout for dashboards, and public navbar for public pages.

## API Base URL
Configured in `src/api.js` — defaults to `http://localhost:5000/api`.
To change, update the `baseURL` in that file or use an environment variable.
