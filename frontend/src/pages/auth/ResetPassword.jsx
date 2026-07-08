import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff } from 'lucide-react';
import api from '../../api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. No token provided.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        new_password: form.password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: res.data?.message || 'Password reset successful!' } });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo.png" alt="ShortStay Logo" style={{ height: 42 }} />
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Password Reset!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Your password has been successfully updated. Redirecting to login...</p>
              <Link to="/login"><button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>Go to Login</button></Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Reset Password</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 13, textAlign: 'center' }}>Create a new strong password for your account.</p>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#4b5563' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} style={{ width: '100%', padding: '12px 14px', paddingRight: 40, borderRadius: 4, border: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 14 }} placeholder="New Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#4b5563' }}>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirmPassword ? 'text' : 'password'} style={{ width: '100%', padding: '12px 14px', paddingRight: 40, borderRadius: 4, border: '1px solid #e5e7eb', background: '#f3f4f6', fontSize: 14 }} placeholder="Confirm New Password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required minLength={6} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || !token}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 8 }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
