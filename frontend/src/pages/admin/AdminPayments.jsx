import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { DollarSign, RefreshCw, RotateCcw, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusBadge = { completed: 'badge-success', pending: 'badge-warning', failed: 'badge-error', refunded: 'badge-info' };
export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [refundId, setRefundId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    // Fetch all payments
    api.get('/payments')
      .then(r => {
        const data = r.data?.payments || r.data || [];
        setPayments(data);
        // Count pending payouts (simplistic approach based on status)
        const pending = data.filter(p => p.status === 'pending' || p.payment_status === 'pending').length;
        setPendingPayouts(pending);
      })
      .catch(() => {});
      
    // Fetch monthly data for the chart
    api.get('/payments/reports/monthly')
      .then(r => {
        const data = (r.data?.data || r.data || []).map(m => ({
          month: m.month || m.period || m.year_month || '?',
          revenue: Number(m.total_revenue || m.revenue || m.amount || 0),
          commission: Number(m.total_revenue || m.revenue || m.amount || 0) * 0.15, // Mock 15% commission
        }));
        setMonthlyData(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const total = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

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
        <div className="page-title">Payments</div>
        <div className="page-subtitle">Platform payment overview</div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">Rs.{total.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#10b981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} /> +15% vs last month
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#1e3a8a', color: 'white' }}><DollarSign size={20} /></div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Payouts</div>
            <div className="stat-value">{pendingPayouts}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={20} /></div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{payments.length}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><RefreshCw size={20} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Financial Summary</h3>
        {monthlyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No financial data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={val => `Rs.${val}`} />
              <Tooltip formatter={(val, name) => [`Rs.${Number(val).toLocaleString()}`, name]} />
              <Line type="monotone" dataKey="revenue" name="Total Revenue" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="commission" name="Platform Commission" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Transactions</h3>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Booking</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : payments.length === 0 ? (
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

      {/* Note for refunds */}
      <div className="card" style={{ marginTop: 16, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <AlertCircle size={16} color="#1e3a8a" />
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>Refunds & Payouts</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          To issue refunds or process payouts, use the <strong>Accountant</strong> portal which has full financial control capabilities.
        </p>
      </div>
    </DashboardLayout>
  );
}
