import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { Mail, Eye, EyeOff } from 'lucide-react';
import api from '../../api';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setError(''); 
    if (!terms) {
      setError('You must agree to the Terms and Conditions.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        role: 'guest', // Defaulting to guest per new UI
        phone: ''
      };
      const result = await register(payload);
      if (result.pendingVerification) {
        setPendingEmail(result.email);
      } else {
        navigate('/guest/browse');
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
        <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'center', gap: 24, fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
          <Link to="/" style={{ color: '#1a1a1a' }}>Home</Link>
          <Link to="/contact" style={{ color: '#1a1a1a' }}>Contact</Link>
          <Link to="/about" style={{ color: '#1a1a1a' }}>About</Link>
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

  return (
    <div style={{ minHeight: '100vh', background: '#fcfcfd', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'center', gap: 24, fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
        <Link to="/" style={{ color: '#1a1a1a' }}>Home</Link>
        <Link to="/contact" style={{ color: '#1a1a1a' }}>Contact</Link>
        <Link to="/about" style={{ color: '#1a1a1a' }}>About</Link>
      </nav>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', width: '100%', maxWidth: 480, padding: '48px 40px', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32, textAlign: 'center', color: '#1a1a1a' }}>Sign Up Free</h2>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}
          
          <form onSubmit={submit}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#4b5563' }}>First Name</label>
                <input style={{ width: '100%', padding: '12px 14px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 14 }} placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#4b5563' }}>Last Name</label>
                <input style={{ width: '100%', padding: '12px 14px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 14 }} placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#4b5563' }}>Email</label>
              <input type="email" style={{ width: '100%', padding: '12px 14px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 14 }} placeholder="example@gmail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#4b5563' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} style={{ width: '100%', padding: '12px 14px', paddingRight: 40, borderRadius: 4, border: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 14 }} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="terms" style={{ fontSize: 13, color: '#4b5563', cursor: 'pointer' }}>
                I agree to the <Link to="/terms" target="_blank" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms and Conditions</Link>
              </label>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: '#1e3a8a', color: 'white', padding: '14px', borderRadius: 6, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', marginBottom: 24 }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ position: 'relative', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid #e5e7eb' }}></div>
            <span style={{ position: 'relative', background: 'white', padding: '0 12px', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Or sign up with:</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            <button type="button" onClick={() => window.location.href = `${API_BASE}/api/auth/google?role=guest`} style={{ width: '100%', padding: '12px', background: 'white', border: '1.5px solid #1e3a8a', borderRadius: 6, color: '#1e3a8a', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign up as a Guest (Google)
            </button>

            <button type="button" onClick={() => window.location.href = `${API_BASE}/api/auth/google?role=host`} style={{ width: '100%', padding: '12px', background: 'white', border: '1.5px solid #10b981', borderRadius: 6, color: '#10b981', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign up as a Host (Google)
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 600, textDecoration: 'none' }}>Already have an account?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
