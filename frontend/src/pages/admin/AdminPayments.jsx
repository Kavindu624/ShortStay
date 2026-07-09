import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';

const statusBadge = { completed: 'badge-success', pending: 'badge-warning', failed: 'badge-error', refunded: 'badge-info' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sysCommissionRate, setSysCommissionRate] = useState(10);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/payments').catch(() => ({ data: [] })),
      api.get('/settings').catch(() => ({ data: {} }))
    ]).then(([payRes, settingsRes]) => {
      const data = payRes.data?.payments || payRes.data || [];
      setPayments(data);
      
      const rate = settingsRes.data?.commissionRate || 10;
      setSysCommissionRate(Number(rate));
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const completedPayments = payments.filter(p => p.payment_status === 'completed' || p.status === 'completed');
  const pendingPayments = payments.filter(p => p.payment_status === 'pending' || p.status === 'pending');
  const totalPaymentsAmount = completedPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  
  // Calculate total commission exactly from Payouts if available, else estimate
  const totalCommissionAmount = completedPayments.reduce((s, p) => {
    const payout = p.payout || p.Payout;
    if (payout?.commission_amount) {
      return s + Number(payout.commission_amount);
    }
    return s + (Number(p.amount || 0) * (sysCommissionRate / 100));
  }, 0);

  const totalHostPayouts = totalPaymentsAmount - totalCommissionAmount;

  const validDenominator = payments.length - pendingPayments.length;
  const successRate = validDenominator > 0 
    ? ((completedPayments.length / validDenominator) * 100).toFixed(1)
    : 0;

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">Track all platform transactions</div>
        </div>
        <button className="btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Total Payments</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{totalPaymentsAmount.toLocaleString()} LKR</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Platform Commission</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{totalCommissionAmount.toLocaleString()} LKR</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Pending</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{pendingPayments.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Success Rate</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{successRate}%</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Transaction History</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking</th>
                <th>Guest</th>
                <th>Host</th>
                <th>Amount</th>
                <th>Commission ({sysCommissionRate}%)</th>
                <th>Host Payout</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments found</td></tr>
              ) : payments.map(p => {
                const amount = Number(p.amount || 0);
                let commAmount = amount * (sysCommissionRate / 100);
                let payoutAmount = amount - commAmount;
                
                const payout = p.payout || p.Payout;
                if (payout?.commission_amount) {
                  commAmount = Number(payout.commission_amount);
                  payoutAmount = Number(payout.payout_amount);
                }

                const booking = p.booking || p.Booking;
                const guestName = booking?.guest?.name || 'Unknown';
                const hostName = booking?.property?.host?.name || 'Unknown';
                
                // Format dates to YYYY-MM-DD
                const dateObj = new Date(p.payment_date || p.created_at);
                const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : p.payment_date;
                const year = !isNaN(dateObj.getTime()) ? dateObj.getFullYear() : '2020';

                const status = p.payment_status || p.status || 'completed';

                return (
                  <tr key={p.payment_id}>
                    <td>PAY-{year}-{p.payment_id.toString().padStart(3, '0')}</td>
                    <td>BK-{year}-{p.booking_id.toString().padStart(3, '0')}</td>
                    <td>{guestName}</td>
                    <td>{hostName}</td>
                    <td style={{ fontWeight: 600 }}>{amount.toLocaleString()} LKR</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{commAmount.toLocaleString()} LKR</td>
                    <td>{payoutAmount.toLocaleString()} LKR</td>
                    <td>{p.payment_method === 'card' ? 'Credit Card' : 'Bank Transfer'}</td>
                    <td><span className={`badge ${statusBadge[status] || 'badge-gray'}`}>{status}</span></td>
                    <td>{dateStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Commission Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#4b5563' }}>Total Guest Payments</span>
            <span style={{ fontWeight: 600 }}>{totalPaymentsAmount.toLocaleString()} LKR</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#4b5563' }}>Platform Commission ({sysCommissionRate}%)</span>
            <span style={{ fontWeight: 600, color: '#10b981' }}>-{totalCommissionAmount.toLocaleString()} LKR</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#111827', fontWeight: 600 }}>Total Host Payouts</span>
            <span style={{ fontWeight: 700 }}>{totalHostPayouts.toLocaleString()} LKR</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
