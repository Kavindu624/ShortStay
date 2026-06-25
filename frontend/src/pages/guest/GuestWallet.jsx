import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Download, RefreshCw, CreditCard } from 'lucide-react';

export default function GuestWallet() {
  const [payments, setPayments] = useState([]);
  useEffect(() => { api.get('/payments').then(r => setPayments(r.data || [])).catch(() => {}); }, []);
  const totalSpent = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><div className="page-title">Wallet</div><div className="page-subtitle">Manage your balance and transactions</div></div>
        <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} /> Download Statement</button>
      </div>

      {/* Balance banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #2d50a8)', borderRadius: 12, padding: '24px 28px', marginBottom: 20, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Available Balance</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>Rs.{totalSpent.toLocaleString()}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Available for next booking</div>
        </div>
        <CreditCard size={40} style={{ opacity: 0.4 }} />
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Wallet Balance', value: `Rs.${totalSpent.toLocaleString()}`, color: 'var(--accent)' },
          { label: 'Total Spent', value: `Rs.${totalSpent.toLocaleString()}`, color: 'var(--text-main)' },
          { label: 'Total Refunds', value: 'Rs.0', color: 'var(--accent-orange)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Transaction History</h3>
        {payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No transactions yet.</div>
        ) : payments.map(p => (
          <div key={p.payment_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={16} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Payment</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>BK-{p.booking_id} • {p.payment_date}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-red)' }}>- Rs.{Number(p.amount).toLocaleString()}</div>
              <span className="badge badge-success" style={{ fontSize: 10, marginTop: 4 }}>completed</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>About Refunds</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Refunds are automatically added to your wallet and can be used for future bookings. You can also request a bank transfer for your wallet balance at any time.</p>
        <button className="btn-primary btn-sm">Request Bank Transfer</button>
      </div>
    </DashboardLayout>
  );
}
