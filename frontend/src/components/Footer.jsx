export default function Footer() {
  return (
    <footer style={{ background: '#1a1a2e', color: '#9ca3af', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
        <div>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 8 }}>Company</div>
          {['About StayNest','Careers','Contact Us'].map(t => <div key={t} style={{ marginBottom: 6, fontSize: 13, cursor: 'pointer' }}>{t}</div>)}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 8 }}>Legal</div>
          {['Member Terms','Privacy Policy','Terms & Conditions','Cookies'].map(t => <div key={t} style={{ marginBottom: 6, fontSize: 13, cursor: 'pointer' }}>{t}</div>)}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 8 }}>Support</div>
          <div style={{ fontSize: 13, marginBottom: 6 }}>✉ support@ShortStay.com</div>
          <div style={{ fontSize: 13 }}>📞 0771234567</div>
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
