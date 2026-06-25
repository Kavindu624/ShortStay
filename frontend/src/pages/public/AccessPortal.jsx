import { useNavigate } from 'react-router-dom';
import { Building2, User } from 'lucide-react';

export default function AccessPortal() {
  const navigate = useNavigate();
  const cards = [
    { role: 'host', icon: Building2, title: 'Host', desc: 'List and manage properties', path: '/login' },
    { role: 'guest', icon: User, title: 'Guest', desc: 'Browse and book properties', path: '/login' },
  ];
  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, padding: 24 }}>
      {cards.map(c => (
        <div key={c.role} className="card" style={{ width: 260, textAlign: 'center', padding: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.10)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.10)'; }}>
          <c.icon size={48} color="var(--primary)" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{c.title}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 13 }}>{c.desc}</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 8 }} onClick={() => navigate(c.path)}>
            Access Portal
          </button>
        </div>
      ))}
    </div>
  );
}
