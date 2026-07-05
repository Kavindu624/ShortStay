import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  LayoutDashboard, Home, Calendar, MessageSquare, DollarSign, Star,
  Settings, LogOut, Users, Building2, FileText, Search, Bell,
  ShieldCheck, ClipboardList, CreditCard, BarChart3, AlertCircle, Map
} from 'lucide-react';

const menuByRole = {
  guest: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/guest' },
    { label: 'Browse Listings', icon: Home, path: '/guest/browse' },
    { label: 'My Bookings', icon: Calendar, path: '/guest/bookings' },
    { label: 'Wallet', icon: DollarSign, path: '/guest/wallet' },
    { label: 'My Reviews', icon: Star, path: '/guest/reviews' },
    { label: 'Complaints', icon: AlertCircle, path: '/guest/complaints' },
    { label: 'Settings', icon: Settings, path: '/guest/settings' },
  ],
  host: [
    { label: 'My Listings', icon: Home, path: '/host/listings' },
    { label: 'Bookings', icon: Calendar, path: '/host/bookings' },
    { label: 'Availability', icon: Map, path: '/host/calendar' },
    { label: 'Earnings', icon: DollarSign, path: '/host/payouts' },
    { label: 'Reviews', icon: Star, path: '/host/reviews' },
    { label: 'Settings', icon: Settings, path: '/host/settings' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Properties', icon: Building2, path: '/admin/properties' },
    { label: 'Bookings', icon: Calendar, path: '/admin/bookings' },
    { label: 'Complaints', icon: AlertCircle, path: '/admin/complaints' },
    { label: 'Payments', icon: DollarSign, path: '/admin/payments' },
    { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ],
  field_inspector: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/inspector/inspections' },
    { label: 'Pending', icon: ClipboardList, path: '/inspector/pending' },
    { label: 'History', icon: ShieldCheck, path: '/inspector/history' },
    { label: 'Settings', icon: Settings, path: '/inspector/settings' },
  ],
  payment_manager: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/pm/dashboard' },
    { label: 'Payments', icon: CreditCard, path: '/pm/payments' },
    { label: 'Payouts', icon: DollarSign, path: '/pm/payouts' },
    { label: 'Disputes', icon: AlertCircle, path: '/pm/disputes' },
    { label: 'Reports', icon: BarChart3, path: '/pm/reports' },
  ],
};

const panelLabel = {
  guest: 'Guest Panel',
  host: 'Host Panel',
  admin: 'Admin Panel',
  field_inspector: 'Inspector Panel',
  payment_manager: 'Accountant Panel',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = menuByRole[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside style={{
      width: 'var(--sidebar-w)', background: 'white', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'var(--primary)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>ShortStay</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, paddingLeft: 2 }}>{panelLabel[user?.role] || ''}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {items.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/guest'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 8, marginBottom: 2, fontWeight: 500, fontSize: 13,
              color: isActive ? 'white' : 'var(--text-muted)',
              background: isActive ? 'var(--primary)' : 'transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
            })}>
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLogout} className="btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 8 }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}
