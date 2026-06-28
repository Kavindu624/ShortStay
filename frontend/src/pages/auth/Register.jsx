import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { ArrowRight, Building2, Mail } from 'lucide-react';
import api from '../../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'guest' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null); // set when awaiting verification
  const { register } = useAuth();
  const navigate = useNavigate();
  const roleHome = { guest: '/guest/browse', host: '/host/listings' };

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await register(form);
      if (result.pendingVerification) {
        // Backend requires email verification before login
        setPendingEmail(result.email);
      } else {
        // Mock mode: immediate login
        navigate(roleHome[result.user?.role] || '/');
      }
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const resendVerification = async () => {
    try {
      await api.post('/auth/resend-verification', { email: pendingEmail });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend email');
    }
  };

  // ── Email verification pending state ─────────────────────────────────────────
  if (pendingEmail) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'var(--primary)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={20} color="white" /></div>
            <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>ShortStay</span>
          </Link>
        </nav>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Mail size={32} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Check your email</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 14 }}>
              We've sent a verification link to
            </p>
            <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 24, fontSize: 15 }}>{pendingEmail}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              Please click the link in the email to activate your account before logging in. The link will expire in 24 hours.
            </p>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/login">
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>
                  Go to Login
                </button>
              </Link>
              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '11px 20px', fontSize: 13 }} onClick={resendVerification}>
                Resend verification email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'var(--primary)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={20} color="white" /></div>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>ShortStay</span>
        </Link>
        <Link to="/login"><button className="btn-primary">Log In</button></Link>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ width: '100%', maxWidth: 460, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24, fontSize: 13 }}>Join ShortStay today</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="Enter email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+94 77 123 4567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Create password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">I want to</label>
              <select className="form-select form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="guest">Browse & Book (Guest)</option>
                <option value="host">List My Property (Host)</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 8 }}>
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
