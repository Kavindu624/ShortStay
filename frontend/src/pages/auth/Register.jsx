import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { Mail, Eye, EyeOff, Building2 } from 'lucide-react';
import api from '../../api';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [role, setRole] = useState('guest');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setError(''); setSuccessMsg('');
    if (!terms) {
      setError('You must agree to the Terms and Conditions.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        role: role,
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
      setSuccessMsg('A new verification link has been sent to your email!');
    } catch (err) {
      setSuccessMsg('');
      setError(err.response?.data?.message || 'Could not resend email');
    }
  };

  // ── Polling for cross-device verification ──────────────────────────────────

  useEffect(() => {
    let intervalId;
    if (pendingEmail) {
      intervalId = setInterval(async () => {
        try {
          const res = await api.get(`/auth/check-verification/${pendingEmail}`);
          if (res.data?.isVerified) {
            clearInterval(intervalId);
            // Email was verified on another device!
            navigate('/login', { state: { message: 'Email verified successfully! Please login.' } });
          }
        } catch (err) {
          // Ignore polling errors
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [pendingEmail, navigate]);

  // ── Email verification pending state ─────────────────────────────────────────
  if (pendingEmail) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/logo.png" alt="ShortStay Logo" style={{ height: 42 }} />
          </Link>
          <div style={{ display: 'flex', gap: 24, fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
            <Link to="/" style={{ color: '#1a1a1a', textDecoration: 'none' }}>Home</Link>
            <Link to="/contact" style={{ color: '#1a1a1a', textDecoration: 'none' }}>Contact</Link>
            <Link to="/about" style={{ color: '#1a1a1a', textDecoration: 'none' }}>About</Link>
          </div>
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
              <br /><br />
              <strong>Did you verify on your phone?</strong> Don't worry, this page will automatically redirect once your email is verified.
            </p>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            {successMsg && <div className="alert alert-success" style={{ marginBottom: 16, background: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 8, fontSize: 14 }}>{successMsg}</div>}
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
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo.png" alt="ShortStay Logo" style={{ height: 42 }} />
        </Link>
        <div style={{ display: 'flex', gap: 24, fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
          <Link to="/" style={{ color: '#1a1a1a', textDecoration: 'none' }}>Home</Link>
          <Link to="/contact" style={{ color: '#1a1a1a', textDecoration: 'none' }}>Contact</Link>
          <Link to="/about" style={{ color: '#1a1a1a', textDecoration: 'none' }}>About</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', width: '100%', maxWidth: 480, padding: '48px 40px', borderRadius: 16, boxShadow: '0 12px 48px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, textAlign: 'center', color: '#1a1a1a' }}>Sign Up Free</h2>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <button type="button" onClick={() => setRole('guest')} style={{ flex: 1, padding: '12px', borderRadius: 8, border: role === 'guest' ? '2px solid #1e3a8a' : '1px solid #e5e7eb', background: role === 'guest' ? '#eff6ff' : 'white', color: role === 'guest' ? '#1e3a8a' : '#4b5563', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              I'm a Guest
            </button>
            <button type="button" onClick={() => setRole('host')} style={{ flex: 1, padding: '12px', borderRadius: 8, border: role === 'host' ? '2px solid #10b981' : '1px solid #e5e7eb', background: role === 'host' ? '#ecfdf5' : 'white', color: role === 'host' ? '#10b981' : '#4b5563', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              I'm a Host
            </button>
          </div>

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

            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#4b5563' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} style={{ width: '100%', padding: '12px 14px', paddingRight: 40, borderRadius: 4, border: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 14 }} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#4b5563' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? 'text' : 'password'} style={{ width: '100%', padding: '12px 14px', paddingRight: 40, borderRadius: 4, border: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 14 }} placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required minLength={6} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="terms" style={{ fontSize: 13, color: '#4b5563', cursor: 'pointer' }}>
                I agree to the <Link to="/terms" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms and Conditions</Link>
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
            <button type="button" onClick={() => window.location.href = `${API_BASE}/api/auth/google?role=${role}&action=register`} style={{ width: '100%', padding: '12px', background: 'white', border: `1.5px solid ${role === 'guest' ? '#1e3a8a' : '#10b981'}`, borderRadius: 6, color: role === 'guest' ? '#1e3a8a' : '#10b981', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Sign up with Google
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
