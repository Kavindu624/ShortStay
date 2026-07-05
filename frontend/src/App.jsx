import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { useEffect } from 'react';

// Public
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import PropertyDetail from './pages/public/PropertyDetail';
import AccessPortal from './pages/public/AccessPortal';
import Terms from './pages/public/Terms';

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
import GuestComplaints from './pages/guest/GuestComplaints';

// Host
import HostDashboard from './pages/host/HostDashboard';
import HostListings from './pages/host/HostListings';
import PropertyForm from './pages/host/PropertyForm';
import HostBookings from './pages/host/HostBookings';
import HostReviews from './pages/host/HostReviews';
import HostCalendar from './pages/host/HostCalendar';
import HostPayouts from './pages/host/HostPayouts';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// Inspector
import InspectorDashboard from './pages/inspector/InspectorDashboard';
import InspectorPending from './pages/inspector/InspectorPending';
import InspectorHistory from './pages/inspector/InspectorHistory';

// Payment Manager
import PMDashboard from './pages/payment_manager/PMDashboard';
import PMPayments from './pages/payment_manager/PMPayments';
import PMReports from './pages/payment_manager/PMReports';
import PMPayouts from './pages/payment_manager/PMPayouts';

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

/** Handles the Google OAuth callback at /auth/callback?token=xxx&role=xxx&name=xxx */
function OAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { } = useAuth(); // just to ensure context is ready

  useEffect(() => {
    const token = params.get('token');
    const role = params.get('role');
    const name = params.get('name');
    const userId = params.get('user_id');

    if (token) {
      localStorage.setItem('token', token);
      const userObj = { user_id: Number(userId), role, name };
      localStorage.setItem('user', JSON.stringify(userObj));
      // Hard reload so AuthContext picks up the new user from localStorage
      const home = { guest: '/guest/browse', host: '/host/listings', admin: '/admin/dashboard', field_inspector: '/inspector/inspections', payment_manager: '/pm/dashboard' };
      window.location.href = home[role] || '/';
    } else {
      navigate('/login?error=google_failed', { replace: true });
    }
  }, []);

  return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Logging in via Google...</div>;
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
          <Route path="/terms" element={<Terms />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* OAuth callback */}
          <Route path="/auth/callback" element={<OAuthCallback />} />

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
          <Route path="/guest/complaints" element={<ProtectedRoute role="guest"><GuestComplaints /></ProtectedRoute>} />
          <Route path="/guest/settings" element={<ProtectedRoute role="guest"><GuestSettings /></ProtectedRoute>} />

          {/* Host */}
          <Route path="/host" element={<ProtectedRoute role="host"><HostDashboard /></ProtectedRoute>} />
          <Route path="/host/listings" element={<ProtectedRoute role="host"><HostListings /></ProtectedRoute>} />
          <Route path="/host/listings/new" element={<ProtectedRoute role="host"><PropertyForm /></ProtectedRoute>} />
          <Route path="/host/listings/edit/:id" element={<ProtectedRoute role="host"><PropertyForm /></ProtectedRoute>} />
          <Route path="/host/bookings" element={<ProtectedRoute role="host"><HostBookings /></ProtectedRoute>} />
          <Route path="/host/calendar" element={<ProtectedRoute role="host"><HostCalendar /></ProtectedRoute>} />
          <Route path="/host/payouts" element={<ProtectedRoute role="host"><HostPayouts /></ProtectedRoute>} />
          <Route path="/host/reviews" element={<ProtectedRoute role="host"><HostReviews /></ProtectedRoute>} />
          <Route path="/host/settings" element={<ProtectedRoute role="host"><GuestSettings /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/properties" element={<ProtectedRoute role="admin"><AdminProperties /></ProtectedRoute>} />
          <Route path="/admin/complaints" element={<ProtectedRoute role="admin"><AdminComplaints /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

          {/* Inspector */}
          <Route path="/inspector" element={<ProtectedRoute role="field_inspector"><InspectorDashboard /></ProtectedRoute>} />
          <Route path="/inspector/inspections" element={<ProtectedRoute role="field_inspector"><InspectorDashboard /></ProtectedRoute>} />
          <Route path="/inspector/pending" element={<ProtectedRoute role="field_inspector"><InspectorPending /></ProtectedRoute>} />
          <Route path="/inspector/history" element={<ProtectedRoute role="field_inspector"><InspectorHistory /></ProtectedRoute>} />
          <Route path="/inspector/settings" element={<ProtectedRoute role="field_inspector"><InspectorDashboard /></ProtectedRoute>} />

          {/* Payment Manager */}
          <Route path="/pm/dashboard" element={<ProtectedRoute role="payment_manager"><PMDashboard /></ProtectedRoute>} />
          <Route path="/pm/payouts" element={<ProtectedRoute role="payment_manager"><PMPayouts /></ProtectedRoute>} />
          <Route path="/pm/payments" element={<ProtectedRoute role="payment_manager"><PMPayments /></ProtectedRoute>} />
          <Route path="/pm/disputes" element={<ProtectedRoute role="payment_manager"><PMPayments /></ProtectedRoute>} />
          <Route path="/pm/reports" element={<ProtectedRoute role="payment_manager"><PMReports /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
