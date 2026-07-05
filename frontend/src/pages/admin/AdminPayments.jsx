import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { DollarSign, RefreshCw, RotateCcw, AlertCircle } from 'lucide-react';

const statusBadge = { completed: 'badge-success', pending: 'badge-warning', failed: 'badge-error', refunded: 'badge-info' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('bookings');
  const [refundId, setRefundId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    // Admin uses the PM payment endpoint (all payments)
    api.get('/payments').then(r => setPayments(r.data?.payments || r.data || [])).catch(() => {});
    // Try admin reports endpoint for booking overview
    // Reports controller returns { generated_at, data: [...] }
    api.get('/admin/reports/bookings').then(r => setBookings(r.data?.data || r.data?.bookings || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const total = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  const issueRefund = async () => {
    if (!refundId) return;
    setMsg('');
    try {
      await api.post(`/payments/refund/${refundId}`, { reason: refundReason });
      setMsg(`Refund issued for booking #${refundId}`);
      setRefundId(''); setRefundReason('');
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title">Payments & Bookings</div>
        <div className="page-subtitle">Platform payment and booking overview</div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Bookings', value: totalBookings, icon: '📅' },
          { label: 'Confirmed', value: confirmedBookings, icon: '✅' },
          { label: 'Total Revenue', value: `Rs.${total.toLocaleString()}`, icon: '💰' },
          { label: 'Transactions', value: payments.length, icon: '💳' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
            <div className="stat-icon"><span style={{ fontSize: 20 }}>{s.icon}</span></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['bookings', 'All Bookings'], ['payments', 'Payment History']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1.5px solid', borderColor: tab === key ? 'var(--primary)' : 'var(--border)', background: tab === key ? 'var(--primary)' : 'white', color: tab === key ? 'white' : 'var(--text-muted)', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : tab === 'bookings' ? (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Guest</th><th>Property</th><th>Check-in</th><th>Check-out</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found</td></tr>
                ) : bookings.map(b => (
                  <tr key={b.booking_id}>
                    <td>#{b.booking_id}</td>
                    <td>{b.guest?.name || b.User?.name || (typeof b.guest === 'string' ? b.guest : `Guest #${b.guest_id || 'Unknown'}`)}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.Property?.title || b.property?.title || (typeof b.property === 'string' ? b.property : `Property #${b.property_id || 'Unknown'}`)}</td>
                    <td style={{ fontSize: 12 }}>{b.checkin_date}</td>
                    <td style={{ fontSize: 12 }}>{b.checkout_date}</td>
                    <td style={{ fontWeight: 700 }}>Rs.{Number(b.total_price).toLocaleString()}</td>
                    <td><span className={`badge ${statusBadge[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Booking</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments found</td></tr>
                ) : payments.map(p => (
                  <tr key={p.payment_id}>
                    <td>#{p.payment_id}</td>
                    <td>#{p.booking_id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>Rs.{Number(p.amount).toLocaleString()}</td>
                    <td>{p.payment_method || 'card'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.payment_date}</td>
                    <td><span className={`badge ${statusBadge[p.payment_status] || statusBadge[p.status] || 'badge-gray'}`}>{p.payment_status || p.status || 'completed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note for refunds */}
      <div className="card" style={{ marginTop: 16, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <AlertCircle size={16} color="#1e3a8a" />
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>Refunds & Payouts</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          To issue refunds or process payouts, use the <strong>Payment Manager</strong> portal which has full financial control capabilities.
        </p>
      </div>
    </DashboardLayout>
  );
}
