import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ background: 'var(--primary)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>ShortStay</span>
        </Link>
        <Link to="/register"><button className="btn-primary">Sign Up</button></Link>
      </nav>

      <div style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ background: 'white', width: '100%', maxWidth: 800, margin: '0 auto', padding: '48px 64px', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.04)' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, color: '#1a1a1a' }}>Terms and Conditions</h1>
          <p style={{ color: '#6b7280', marginBottom: 32 }}>Last Updated: July 5, 2026</p>

          <div style={{ color: '#4b5563', lineHeight: 1.7, fontSize: 15, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <section>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>1. Agreement to Terms</h2>
              <p>By accessing or using the ShortStay platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access our services.</p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>2. User Accounts</h2>
              <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our platform.</p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>3. Host Responsibilities</h2>
              <p>If you register as a Host, you are responsible for ensuring that your properties meet all local laws, safety regulations, and tax requirements. ShortStay acts only as a facilitator for bookings and is not liable for property damages or guest conduct.</p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>4. Guest Responsibilities</h2>
              <p>Guests agree to treat all properties with respect and follow the specific house rules outlined by the Host. Any damages caused during a stay will be charged directly to the payment method on file.</p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>5. Payments & Cancellations</h2>
              <p>All payments are securely processed. Our cancellation policy dictates that guests may receive full refunds if cancellations are made at least 48 hours prior to check-in, subject to the individual property's strictness settings.</p>
            </section>

            <section>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>6. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days notice prior to any new terms taking effect.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
