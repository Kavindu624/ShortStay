import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Download, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { exportToCSV } from '../../utils';

const COLORS = ['#1e3a8a', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function HostPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Request up to 50 payouts to ensure we have enough data for charts
    api.get('/payouts/my-payouts?limit=50')
      .then(r => setPayouts(r.data?.payouts || r.data || []))
      .catch(() => setPayouts([]))
      .finally(() => setLoading(false));
  }, []);

  // 1. Calculate Summary Totals
  const totalGross = payouts.reduce((s, p) => s + parseFloat(p.gross_amount || 0), 0);
  const totalCommission = payouts.reduce((s, p) => s + parseFloat(p.commission_amount || 0), 0);
  const totalNet = payouts.reduce((s, p) => s + parseFloat(p.payout_amount || 0), 0);

  // 2. Aggregate Data for Line Chart (Monthly Trend)
  const monthlyDataMap = {};
  payouts.forEach(p => {
    if (!p.created_at) return;
    const date = new Date(p.created_at);
    const month = date.toLocaleString('default', { month: 'short' });
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { name: month, Gross: 0, Net: 0 };
    }
    monthlyDataMap[month].Gross += parseFloat(p.gross_amount || 0);
    monthlyDataMap[month].Net += parseFloat(p.payout_amount || 0);
  });
  
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendData = Object.values(monthlyDataMap).sort((a, b) => allMonths.indexOf(a.name) - allMonths.indexOf(b.name));

  // 3. Aggregate Data for Pie Chart (Earnings by Property)
  const propertyDataMap = {};
  payouts.forEach(p => {
    const title = p.booking?.property?.title || 'Unknown Property';
    if (!propertyDataMap[title]) {
      propertyDataMap[title] = { name: title, value: 0 };
    }
    propertyDataMap[title].value += parseFloat(p.payout_amount || 0);
  });
  const propertyData = Object.values(propertyDataMap).sort((a, b) => b.value - a.value);

  if (loading) {
    return <DashboardLayout><div style={{ padding: 20 }}>Loading earnings data...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Earnings</div>
          <div className="page-subtitle">Track your revenue and payouts</div>
        </div>
        <button className="btn-primary" onClick={() => exportToCSV(payouts, 'host_payouts_report.csv')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={16} /> Download CSV Report
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Total Gross Earnings</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{totalGross.toLocaleString()} LKR</div>
          <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
            <TrendingUp size={14} /> +23% from last month
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Platform Commission</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>-{totalCommission.toLocaleString()} LKR</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Net Earnings</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{totalNet.toLocaleString()} LKR</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 24 }}>Earnings Trend</h3>
          <div style={{ height: 300 }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `${val/1000}k`} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="Gross" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 4, fill: '#1e3a8a', strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="Net" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 24 }}>Earnings by Property</h3>
          <div style={{ height: 300 }}>
            {propertyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={propertyData} cx="50%" cy="45%" innerRadius={0} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                    {propertyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => `${val.toLocaleString()} LKR`} />
                  <Legend verticalAlign="bottom" height={36} iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Payout History */}
      <div className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Recent Payout History</h3>
        {payouts.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No recent payouts found.</div>
        ) : (
          <table className="table" style={{ width: '100%', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ paddingBottom: 16 }}>Date</th>
                <th style={{ paddingBottom: 16 }}>Booking</th>
                <th style={{ paddingBottom: 16 }}>Property</th>
                <th style={{ paddingBottom: 16 }}>Gross Amount</th>
                <th style={{ paddingBottom: 16 }}>Commission</th>
                <th style={{ paddingBottom: 16 }}>Net Payout</th>
                <th style={{ paddingBottom: 16 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.slice(0, 5).map(p => (
                <tr key={p.payout_id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 0' }}>{new Date(p.created_at).toISOString().split('T')[0]}</td>
                  <td style={{ padding: '16px 0', fontWeight: 500 }}>BK-{new Date(p.created_at).getFullYear()}-{String(p.booking_id).padStart(3, '0')}</td>
                  <td style={{ padding: '16px 0' }}>{p.booking?.property?.title || 'N/A'}</td>
                  <td style={{ padding: '16px 0' }}>{parseFloat(p.gross_amount).toLocaleString()} LKR</td>
                  <td style={{ padding: '16px 0', color: '#ef4444' }}>-{parseFloat(p.commission_amount).toLocaleString()} LKR</td>
                  <td style={{ padding: '16px 0', color: '#10b981', fontWeight: 600 }}>{parseFloat(p.payout_amount).toLocaleString()} LKR</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: p.status === 'completed' ? '#d1fae5' : '#fef3c7',
                      color: p.status === 'completed' ? '#059669' : '#d97706'
                    }}>
                      {p.status === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Earnings Breakdown */}
      <div className="card" style={{ padding: 24, marginBottom: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Earnings Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Guest Payments</span>
            <span style={{ fontWeight: 600 }}>{totalGross.toLocaleString()} LKR</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Platform Commission</span>
            <span style={{ color: '#ef4444', fontWeight: 600 }}>-{totalCommission.toLocaleString()} LKR</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
            <span style={{ fontWeight: 700 }}>Your Net Earnings</span>
            <span style={{ color: '#10b981', fontWeight: 700, fontSize: 16 }}>{totalNet.toLocaleString()} LKR</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
