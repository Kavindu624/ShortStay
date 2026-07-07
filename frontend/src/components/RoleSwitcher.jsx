import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ROLES = [
  { key: 'admin',           label: '🛡️ Admin',            path: '/admin/dashboard' },
  { key: 'guest',           label: '🏠 Guest',             path: '/guest/browse' },
  { key: 'host',            label: '🏡 Host',              path: '/host/listings' },
  { key: 'verifier', label: '🔍 Inspector',         path: '/inspector/inspections' },
  { key: 'accountant', label: '💳 Accountant',  path: '/pm/dashboard' },
];

const PUBLIC_PAGES = [
  { label: '🌐 Home',          path: '/' },
  { label: '📖 About',         path: '/about' },
  { label: '📞 Contact',       path: '/contact' },
  { label: '🔑 Access Portal', path: '/access-portal' },
  { label: '🔒 Login',         path: '/login' },
  { label: '📝 Register',      path: '/register' },
];

export default function RoleSwitcher() {
  const auth = useAuth();
  const user = auth?.user;
  const switchMockRole = auth?.switchMockRole;
  if (!auth) return null;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleRole = (role) => {
    switchMockRole(role);
    const target = ROLES.find(r => r.key === role);
    if (target) navigate(target.path);
    setOpen(false);
  };

  const handlePublic = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Mock Role Switcher"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 99999,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: 22,
          boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '✕' : '👁️'}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 88,
          right: 24,
          zIndex: 99998,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          padding: '20px',
          minWidth: 240,
          border: '1px solid #e5e7eb',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {/* Header */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              🎭 Mock Mode
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Current: <strong style={{ color: '#111' }}>{user?.role || 'none'}</strong>
            </div>
          </div>

          <div style={{ height: 1, background: '#f3f4f6', margin: '12px 0' }} />

          {/* Role switcher */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Dashboards
          </div>
          {ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => handleRole(r.key)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                marginBottom: 4,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: user?.role === r.key ? 700 : 400,
                background: user?.role === r.key ? '#eef2ff' : 'transparent',
                color: user?.role === r.key ? '#6366f1' : '#374151',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (user?.role !== r.key) e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { if (user?.role !== r.key) e.currentTarget.style.background = 'transparent'; }}
            >
              {r.label}
            </button>
          ))}

          <div style={{ height: 1, background: '#f3f4f6', margin: '12px 0' }} />

          {/* Public pages */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Public Pages
          </div>
          {PUBLIC_PAGES.map(p => (
            <button
              key={p.path}
              onClick={() => handlePublic(p.path)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '7px 12px',
                marginBottom: 3,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                background: 'transparent',
                color: '#374151',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
