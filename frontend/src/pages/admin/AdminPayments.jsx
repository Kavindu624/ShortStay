import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  useEffect(() => { api.get('/payments').then(r => setPayments(r.data || [])).catch(() => {}); }, []);
  const total = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Payments</div><div className="page-subtitle">Platform payment overview</div></div>
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div><div className="stat-label">Total Payments</div><div className="stat-value">{payments.length}</div></div></div>
        <div className="stat-card"><div><div className="stat-label">Total Revenue</div><div className="stat-value">Rs.{total.toLocaleString()}</div></div></div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Booking</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {payments.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments</td></tr>
                : payments.map(p => (
                  <tr key={p.payment_id}>
                    <td>#{p.payment_id}</td>
                    <td>#{p.booking_id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>Rs.{Number(p.amount).toLocaleString()}</td>
                    <td>{p.payment_date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
