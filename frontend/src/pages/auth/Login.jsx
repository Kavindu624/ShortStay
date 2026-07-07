import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleHome = { guest: '/guest/browse', host: '/host/listings', admin: '/admin/dashboard', verifier: '/inspector/inspections', accountant: '/pm/dashboard' };

  useEffect(() => {
    const token = searchParams.get('token');
    const authError = searchParams.get('error');
    if (authError) {
      setError(authError.replace(/_/g, ' '));
    } else if (token) {
      setLoading(true);
      loginWithToken(token)
        .then((user) => navigate(roleHome[user.role] || '/'))
        .catch(() => setError('Failed to authenticate via Google.'))
        .finally(() => setLoading(false));
    }
  }, [searchParams, loginWithToken, navigate]);

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const next = searchParams.get('next');
      navigate(next || roleHome[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ background: 'var(--primary)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={20} color="white" /></div>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>ShortStay</span>
        </Link>
        <div style={{ display: 'flex', gap: 24, fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
          <Link to="/" style={{ color: '#1a1a1a', textDecoration: 'none' }}>Home</Link>
          <Link to="/contact" style={{ color: '#1a1a1a', textDecoration: 'none' }}>Contact</Link>
          <Link to="/about" style={{ color: '#1a1a1a', textDecoration: 'none' }}>About</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24, fontSize: 13 }}>Sign in to your ShortStay account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="Enter email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password</label>
              <input className="form-input" type={show ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: 34, background: 'none', color: 'var(--text-muted)' }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 500 }}>Forgot Password?</Link>
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 8 }}>
              {loading ? 'Signing in...' : <><span>Login</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ position: 'relative', textAlign: 'center', margin: '24px 0' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid #e5e7eb' }}></div>
            <span style={{ position: 'relative', background: 'white', padding: '0 12px', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Or log in with:</span>
          </div>

          <button type="button" onClick={() => window.location.href = `${API_BASE}/api/auth/google?action=login`} style={{ width: '100%', padding: '12px', background: 'white', border: '1.5px solid #1e3a8a', borderRadius: 6, color: '#1e3a8a', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginBottom: 24 }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
