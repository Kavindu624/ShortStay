import { useNavigate, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import Footer from './Footer';

/**
 * A minimal layout for public-facing pages (e.g. /browse, /browse/property/:id).
 * Shows a clean top nav with Login / Sign Up buttons — no sidebar, no Logout.
 */
export default function PublicLayout({ children }) {
  const nav = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f6fa' }}>
      {/* Top nav */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            background: 'var(--primary)', borderRadius: 8,
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>ShortStay</span>
        </Link>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => nav('/login')}
            style={{
              background: 'transparent', border: '1.5px solid var(--primary)',
              color: 'var(--primary)', fontWeight: 600, fontSize: 13,
              padding: '7px 18px', borderRadius: 8, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            Log In
          </button>
          <button
            onClick={() => nav('/register')}
            className="btn-primary"
            style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13 }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
