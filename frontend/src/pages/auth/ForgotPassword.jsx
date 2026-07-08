import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import api from '../../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo.png" alt="ShortStay Logo" style={{ height: 42 }} />
        </Link>
        <Link to="/login"><button className="btn-primary">Log In</button></Link>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', textAlign: 'center' }}>
          {sent ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Check your email</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>We've sent a reset link to <strong>{email}</strong></p>
              <Link to="/login"><button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>Back to Login</button></Link>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Forgotten your password?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 13 }}>There is nothing to worry about, we'll send you a message to help you reset your password.</p>
              {error && <div className="alert alert-error" style={{ marginBottom: 16, textAlign: 'left' }}>{error}</div>}
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading || !email}
                style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 8 }}
              >
                {loading ? 'Sending...' : <><span>Send Reset Link</span><ArrowRight size={16} /></>}
              </button>
              <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                Remember your password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
