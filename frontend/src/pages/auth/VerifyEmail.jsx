import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link — no token found.');
      return;
    }
    api.get(`/auth/verify-email/${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data?.message || 'Your email has been verified successfully!');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'The verification link is invalid or has expired.');
      });
  }, [searchParams]);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'var(--primary)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={20} color="white" /></div>
          <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>ShortStay</span>
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Verifying your email…</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={36} color="#10b981" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#065f46' }}>Email Verified!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>{message}</p>
              <Link to="/login">
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>
                  Continue to Login
                </button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <XCircle size={36} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#991b1b' }}>Verification Failed</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>{message}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/register">
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px' }}>
                    Register Again
                  </button>
                </Link>
                <Link to="/login">
                  <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '11px 20px', fontSize: 13 }}>
                    Back to Login
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
