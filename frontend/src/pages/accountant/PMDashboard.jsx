import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export default function PMDashboard() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/dashboard/payment-manager'),
      api.get('/payments'),
      api.get('/payouts')
    ]).then(([statRes, payRes, payoutRes]) => {
      if (statRes.status === 'fulfilled') setStats(statRes.value.data);
      if (payRes.status === 'fulfilled') {
        const hData = payRes.value.data?.payments || payRes.value.data || [];
        setPayments(hData.slice(0, 5));
      }
      if (payoutRes.status === 'fulfilled') {
        const pData = payoutRes.value.data?.payouts || payoutRes.value.data || [];
        setPayouts(pData);
      }
    }).finally(() => setLoading(false));
  }, []);

  const monthlyBreakdown = stats?.revenue_stats?.monthly_breakdown || {};
  const chartData = Object.entries(monthlyBreakdown).slice(-6).map(([key, val]) => {
    return {
      month: key.split(' ')[0].substring(0, 3), // Jul, Aug
      revenue: val,
      commission: val * 0.1
    };
  });

  const totalEarnings = stats?.payment_stats?.total_revenue || 0;
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length;
  const completedPayouts = payouts.filter(p => p.status === 'completed').length;
  const monthlyCommission = totalEarnings * 0.1;

  const totalRevenue = stats?.payment_stats?.total_revenue || 0;
  const platformCommission = totalRevenue * 0.1;
  const hostEarnings = totalRevenue - platformCommission;

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">Accountant Dashboard</div>
        <div className="page-subtitle">Manage platform finances and host payouts</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <>
          {/* Top Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
            
            {/* Total Earnings */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Total Earnings</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{totalEarnings.toLocaleString()} LKR</span>
                <div style={{ width: 36, height: 36, background: '#1e3a8a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={20} color="white" />
                </div>
              </div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{stats?.revenue_stats?.revenue_change_pct ? `↑ ${stats.revenue_stats.revenue_change_pct}% vs last month` : ''}</span>
            </div>

            {/* Pending Payouts */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Pending Payouts</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{pendingPayouts}</span>
                <div style={{ width: 36, height: 36, background: '#1e3a8a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color="white" />
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'transparent', fontWeight: 600 }}>.</span>
            </div>

            {/* Completed Payouts */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Completed Payouts</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{completedPayouts}</span>
                <div style={{ width: 36, height: 36, background: '#1e3a8a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={20} color="white" />
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'transparent', fontWeight: 600 }}>.</span>
            </div>

            {/* Monthly Commission */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Monthly Commission</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{monthlyCommission.toLocaleString()} LKR</span>
                <div style={{ width: 36, height: 36, background: '#1e3a8a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={20} color="white" />
                </div>
              </div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>↑ 12% vs last month</span>
            </div>
          </div>

          {/* Line Chart */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: 16 }}>Monthly Financial Summary</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={{ stroke: '#e5e7eb' }} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} domain={[0, 8000000]} ticks={[0, 2000000, 4000000, 6000000, 8000000]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 4, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Actions & Financial Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            
            {/* Pending Actions */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Pending Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Payouts to Release</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{pendingPayouts}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Invoices to Generate</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Pending Refunds</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>0</span>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Financial Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Total Revenue</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{totalRevenue.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Platform Commission</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>{platformCommission.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Host Earnings</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{hostEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Recent Transactions</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {payments.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No transactions yet</div>}
              {payments.map((p, i) => (
                <div key={p.payment_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 4 }}>Payment #{p.payment_id}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Booking #{p.booking_id} • {p.payment_date?.substring(0, 10)}</div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#10b981' }}>{Number(p.amount).toLocaleString()} LKR</div>
                </div>
              ))}
            </div>
          </div>
          
        </>
      )}
    </DashboardLayout>
  );
}
