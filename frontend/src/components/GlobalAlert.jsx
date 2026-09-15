import { useState, useEffect } from 'react';
import { XCircle, CheckCircle } from 'lucide-react';

export default function GlobalAlert() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const handleAlert = (event) => {
      setAlert(event.detail);
    };

    window.addEventListener('GLOBAL_ALERT', handleAlert);
    return () => window.removeEventListener('GLOBAL_ALERT', handleAlert);
  }, []);

  if (!alert) return null;
  const isSuccess = alert.type === 'success';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        {isSuccess
          ? <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 20px' }} />
          : <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 20px' }} />}
        <h2 style={{ marginBottom: 12, fontSize: 24, color: '#111827' }}>{isSuccess ? 'Success' : 'Notice'}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>{alert.message}</p>
        <button className="btn-primary" onClick={() => setAlert(null)} style={{ width: '100%', justifyContent: 'center' }}>Okay</button>
      </div>
    </div>
  );
}
