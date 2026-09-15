import { Link } from 'react-router-dom';

const COMPANY_LINKS = [
  { label: 'About StayNest', to: '/about' },
  { label: 'Careers', to: '/careers' },
  { label: 'Contact Us', to: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Member Terms', to: '/member-terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Cookies', to: '/cookies' },
];

const linkStyle = { display: 'block', marginBottom: 6, fontSize: 13, color: 'inherit', textDecoration: 'none' };

export default function Footer() {
  return (
    <footer style={{ background: '#1a1a2e', color: '#9ca3af', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
        <div>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 8 }}>Company</div>
          {COMPANY_LINKS.map(l => (
            <Link key={l.label} to={l.to} style={linkStyle} onClick={() => window.scrollTo(0, 0)}
              onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 8 }}>Legal</div>
          {LEGAL_LINKS.map(l => (
            <Link key={l.label} to={l.to} style={linkStyle} onClick={() => window.scrollTo(0, 0)}
              onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 8 }}>Support</div>
          <a href="mailto:support@shortstay.com" style={{ ...linkStyle, marginBottom: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
            ✉ support@ShortStay.com
          </a>
          <a href="tel:+94771234567" style={linkStyle}
            onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>
            📞 0771234567
          </a>
        </div>
        <div>
          <div style={{ fontWeight: 800, color: 'white', fontSize: 16, marginBottom: 4 }}>CHOOSE . STAY . CHILL</div>
          <div style={{ fontSize: 13 }}>Your trusted platform for short-stay rentals in Sri Lanka</div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #2d3748', padding: '14px 48px', fontSize: 11, maxWidth: 1200, margin: '0 auto' }}>
        <p>All property listings are subject to availability and verification. © 2025 StayNest Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}
