import { useNavigate } from 'react-router-dom';
import { Building2, User, ShieldCheck, CreditCard, Search } from 'lucide-react';

const cards = [
  {
    role: 'guest',
    icon: User,
    title: 'Guest',
    desc: 'Browse and book properties',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    role: 'host',
    icon: Building2,
    title: 'Host',
    desc: 'List and manage your properties',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    role: 'admin',
    icon: ShieldCheck,
    title: 'Admin',
    desc: 'Platform administration & oversight',
    color: '#dc2626',
    bg: '#fef2f2',
  },
  {
    role: 'payment_manager',
    icon: CreditCard,
    title: 'Accountant',
    desc: 'Manage payments, payouts & disputes',
    color: '#059669',
    bg: '#f0fdf4',
  },
  {
    role: 'field_inspector',
    icon: Search,
    title: 'Verifier',
    desc: 'Inspect and verify property listings',
    color: '#d97706',
    bg: '#fffbeb',
  },
];

export default function AccessPortal() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Building2 size={32} color="white" />
        </div>
        <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, margin: 0 }}>ShortStay Portal</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8, fontSize: 15 }}>Select your role to access your dashboard</p>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 1100, width: '100%' }}>
        {cards.map(c => (
          <div
            key={c.role}
            onClick={() => navigate('/login')}
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '32px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              border: `2px solid transparent`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.20)';
              e.currentTarget.style.borderColor = c.color;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{ background: c.bg, borderRadius: 12, width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <c.icon size={28} color={c.color} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#1e293b' }}>{c.title}</h3>
            <p style={{ color: '#64748b', fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>{c.desc}</p>
            <button
              style={{
                background: c.color,
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Login as {c.title}
            </button>
          </div>
        ))}
      </div>

      {/* Credentials hint for dev */}
      <div style={{ marginTop: 40, background: 'rgba(255,255,255,0.10)', borderRadius: 12, padding: '16px 28px', color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center', maxWidth: 560 }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: 'white', fontSize: 13 }}>🔑 Default Login Credentials</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 24px', textAlign: 'left' }}>
          <span>Admin:</span><span>admin@shortstay.com</span><span>Admin@123</span>
          <span>Accountant:</span><span>pm@shortstay.com</span><span>Pm@12345</span>
          <span>Verifier:</span><span>inspector@shortstay.com</span><span>Inspector@123</span>
        </div>
      </div>
    </div>
  );
}
