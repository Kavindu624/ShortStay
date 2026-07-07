import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Clock, CheckCircle, TrendingUp, Download, AlertTriangle } from 'lucide-react';

export default function PMDashboard() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dashboard stats
    api.get('/dashboard/payment-manager')
      .then(r => setStats(r.data))
      .catch(() => {});

    // Load recent payments
    api.get('/payments')
      // Backend returns { total, payments: [...] }
      .then(r => setPayments(r.data?.payments || r.data || []))
      .catch(() => {});

    // Load disputes
    api.get('/payments/disputes')
      // Backend returns { total, disputes: [...] }
      .then(r => setDisputes(r.data?.disputes || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalEarnings = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const pendingPayouts = stats?.pending_payouts?.count ?? 0;
  const processedPayouts = stats?.processed_payouts ?? 0;

  const resolveDispute = async (id) => {
    try {
      await api.put(`/payments/disputes/${id}/resolve`);
      setDisputes(prev => prev.map(d => d.dispute_id === id ? { ...d, status: 'resolved' } : d));
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  // Build chart from real payments data or fallback to empty
  const chartMap = {};
  payments.forEach(p => {
    const month = p.payment_date?.substring(0, 7) || 'Unknown';
    chartMap[month] = (chartMap[month] || 0) + Number(p.amount || 0);
  });
  const chartData = Object.entries(chartMap).slice(-6).map(([month, revenue]) => ({ month: month.substring(5), revenue }));

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Accountant Dashboard</div><div className="page-subtitle">Manage platform finances and host payouts</div></div>

      <div className="stats-grid">
        {[
          { label: 'Total Revenue', value: `Rs.${totalEarnings.toLocaleString()}`, icon: DollarSign, sub: stats?.revenue_growth ? `↗ ${stats.revenue_growth}% vs last month` : undefined },
          { label: 'Pending Payouts', value: pendingPayouts, icon: Clock },
          { label: 'Completed Payouts', value: processedPayouts, icon: CheckCircle },
          { label: 'Open Disputes', value: disputes.filter(d => d.status !== 'resolved').length, icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div>{s.sub && <div className="stat-sub">{s.sub}</div>}</div>
            <div className="stat-icon"><s.icon size={20} /></div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 20, marginTop: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => [`Rs.${Number(v).toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Disputes */}
      {disputes.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Payment Disputes</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Booking</th><th>Amount</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.dispute_id}>
                    <td>#{d.dispute_id}</td>
                    <td>#{d.booking_id}</td>
                    <td>Rs.{Number(d.amount || 0).toLocaleString()}</td>
                    <td style={{ maxWidth: 160, fontSize: 12 }}>{d.reason}</td>
                    <td><span className={`badge ${d.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span></td>
                    <td>
                      {d.status !== 'resolved' && (
                        <button className="btn-success btn-sm" onClick={() => resolveDispute(d.dispute_id)}>Resolve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Recent Transactions</h3>
        {payments.slice(0, 8).map(p => (
          <div key={p.payment_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Payment #{p.payment_id}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Booking #{p.booking_id} • {p.payment_date} • {p.payment_method || 'Card'}</div>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>+Rs.{Number(p.amount).toLocaleString()}</div>
          </div>
        ))}
        {payments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No transactions yet.</p>}
      </div>
    </DashboardLayout>
  );
}
