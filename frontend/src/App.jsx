import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Public
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import PropertyDetail from './pages/public/PropertyDetail';
import AccessPortal from './pages/public/AccessPortal';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Guest
import GuestDashboard from './pages/guest/GuestDashboard';
import BrowseListings from './pages/guest/BrowseListings';
import GuestPropertyDetail from './pages/guest/GuestPropertyDetail';
import MyBookings from './pages/guest/MyBookings';
import PaymentPage from './pages/guest/PaymentPage';
import GuestWallet from './pages/guest/GuestWallet';
import GuestReviews from './pages/guest/GuestReviews';
import GuestSettings from './pages/guest/GuestSettings';

// Host
import HostDashboard from './pages/host/HostDashboard';
import HostListings from './pages/host/HostListings';
import PropertyForm from './pages/host/PropertyForm';
import HostBookings from './pages/host/HostBookings';
import HostReviews from './pages/host/HostReviews';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/AdminReports';

// Inspector
import InspectorDashboard from './pages/inspector/InspectorDashboard';

// Payment Manager
import PMDashboard from './pages/payment_manager/PMDashboard';
import PMReports from './pages/payment_manager/PMReports';

// Mock role switcher
import RoleSwitcher from './components/RoleSwitcher';

const MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  // In mock mode — skip all auth guards so every page is accessible
  if (MOCK) return children;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const home = { guest: '/guest/browse', host: '/host/listings', admin: '/admin/dashboard', field_inspector: '/inspector/inspections', payment_manager: '/pm/dashboard' };
  return <Navigate to={home[user.role] || '/'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {MOCK && <RoleSwitcher />}
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/access-portal" element={<AccessPortal />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Portal redirect */}
          <Route path="/portal" element={<RoleRedirect />} />

          {/* Guest */}
          <Route path="/guest" element={<ProtectedRoute role="guest"><GuestDashboard /></ProtectedRoute>} />
          <Route path="/guest/browse" element={<ProtectedRoute role="guest"><BrowseListings /></ProtectedRoute>} />
          <Route path="/guest/property/:id" element={<ProtectedRoute role="guest"><GuestPropertyDetail /></ProtectedRoute>} />
          <Route path="/guest/bookings" element={<ProtectedRoute role="guest"><MyBookings /></ProtectedRoute>} />
          <Route path="/guest/pay/:bookingId" element={<ProtectedRoute role="guest"><PaymentPage /></ProtectedRoute>} />
          <Route path="/guest/wallet" element={<ProtectedRoute role="guest"><GuestWallet /></ProtectedRoute>} />
          <Route path="/guest/reviews" element={<ProtectedRoute role="guest"><GuestReviews /></ProtectedRoute>} />
          <Route path="/guest/settings" element={<ProtectedRoute role="guest"><GuestSettings /></ProtectedRoute>} />

          {/* Host */}
          <Route path="/host" element={<ProtectedRoute role="host"><HostDashboard /></ProtectedRoute>} />
          <Route path="/host/listings" element={<ProtectedRoute role="host"><HostListings /></ProtectedRoute>} />
          <Route path="/host/listings/new" element={<ProtectedRoute role="host"><PropertyForm /></ProtectedRoute>} />
          <Route path="/host/listings/edit/:id" element={<ProtectedRoute role="host"><PropertyForm /></ProtectedRoute>} />
          <Route path="/host/bookings" element={<ProtectedRoute role="host"><HostBookings /></ProtectedRoute>} />
          <Route path="/host/earnings" element={<ProtectedRoute role="host"><HostDashboard /></ProtectedRoute>} />
          <Route path="/host/reviews" element={<ProtectedRoute role="host"><HostReviews /></ProtectedRoute>} />
          <Route path="/host/settings" element={<ProtectedRoute role="host"><GuestSettings /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/properties" element={<ProtectedRoute role="admin"><AdminProperties /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/verifier" element={<ProtectedRoute role="admin"><AdminProperties /></ProtectedRoute>} />
          <Route path="/admin/accountant" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/host" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

          {/* Inspector */}
          <Route path="/inspector/inspections" element={<ProtectedRoute role="field_inspector"><InspectorDashboard /></ProtectedRoute>} />
          <Route path="/inspector/settings" element={<ProtectedRoute role="field_inspector"><InspectorDashboard /></ProtectedRoute>} />

          {/* Payment Manager */}
          <Route path="/pm/dashboard" element={<ProtectedRoute role="payment_manager"><PMDashboard /></ProtectedRoute>} />
          <Route path="/pm/payouts" element={<ProtectedRoute role="payment_manager"><PMDashboard /></ProtectedRoute>} />
          <Route path="/pm/payments" element={<ProtectedRoute role="payment_manager"><PMDashboard /></ProtectedRoute>} />
          <Route path="/pm/reports" element={<ProtectedRoute role="payment_manager"><PMReports /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
