import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../AuthContext';

const panelLabel = {
  guest: 'Guest Panel',
  host: 'Host Panel',
  admin: 'Admin Panel',
  field_inspector: 'Inspector Panel',
  payment_manager: 'Accountant Panel',
};

export default function TopBar() {
  const { user } = useAuth();
  return (
    <header style={{
      position: 'fixed', top: 0, left: 'var(--sidebar-w)', right: 0, height: 64,
      background: 'white', borderBottom: '1px solid var(--border)', zIndex: 99,
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16
    }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        <input className="form-input" placeholder="Search properties, bookings, users..."
          style={{ paddingLeft: 36, background: '#f5f6fa', border: '1px solid var(--border)', maxWidth: 400, borderRadius: 8 }} />
      </div>
      <button style={{ background: '#f5f6fa', border: '1px solid var(--border)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Bell size={16} color="var(--text-muted)" />
        <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--accent-red)', borderRadius: '50%', border: '1.5px solid white' }} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={16} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{panelLabel[user?.role] || ''}</div>
        </div>
      </div>
    </header>
  );
}
