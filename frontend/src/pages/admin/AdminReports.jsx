import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import { exportToCSV } from '../../utils';

const PIE_COLORS = ['#1e3a8a', '#10b981', '#f59e0b', '#6b7280', '#ef4444'];

export default function AdminReports() {
  const [monthly, setMonthly] = useState([]);
  const [byProp, setByProp] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      api.get('/payments/reports/monthly'),
      api.get('/payments/reports/by-property'),
      api.get('/payments/reports/refunds'),
      api.get('/payments/reports/host-payouts'),
    ]).then(([m, p, r, h]) => {
      if (m.status === 'fulfilled') setMonthly(m.value.data?.data || m.value.data || []);
      if (p.status === 'fulfilled') setByProp(p.value.data?.data || p.value.data || []);
      if (r.status === 'fulfilled') setRefunds(r.value.data?.data || r.value.data || []);
      if (h.status === 'fulfilled') setHosts(h.value.data?.data || h.value.data || []);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const genReport = async () => {
    setGenLoading(true);
    try { 
      const res = await api.get('/payments/report'); 
      const data = res.data?.payments || [];
      if (data.length > 0) {
        exportToCSV(data, 'full_financial_report.csv');
      } else {
        alert('No data available for the report.');
      }
    }
    catch (err) { console.error(err); alert('Failed to generate report.'); }
    finally { setGenLoading(false); }
  };

  // Normalize monthly data keys (backend may vary)
  const chartMonthly = monthly.map(m => ({
    month: m.month || m.period || m.year_month || '?',
    revenue: Number(m.total_revenue || m.revenue || m.amount || 0),
  }));

  // Pie data: property type breakdown from by-property
  const typeMap = {};
  byProp.forEach(p => {
    const type = p.property_type || p.type || 'Other';
    typeMap[type] = (typeMap[type] || 0) + Number(p.revenue || p.total || 0);
  });
  const pieData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
  if (pieData.length === 0) pieData.push({ name: 'No data', value: 1 });

  const totalRefunded = refunds.reduce((s, r) => s + Number(r.amount || r.refunded || 0), 0);
  const totalRevenue = chartMonthly.reduce((s, m) => s + m.revenue, 0);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">Reports & Analytics</div><div className="page-subtitle">Platform insights and performance metrics</div></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RefreshCw size={14} /> Refresh</button>
          <button className="btn-primary" onClick={genReport} disabled={genLoading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> {genLoading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Revenue', value: `Rs.${totalRevenue.toLocaleString()}` },
          { label: 'Total Refunded', value: `Rs.${totalRefunded.toLocaleString()}` },
          { label: 'Properties in Report', value: byProp.length },
          { label: 'Host Payouts', value: hosts.length },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick report links */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          { label: 'Revenue Report', sub: 'Monthly financial breakdown', icon: '📄', color: '#dbeafe', action: () => exportToCSV(chartMonthly, 'monthly_revenue_report.csv') },
          { label: 'Occupancy Report', sub: 'Property utilization rates', icon: '📈', color: '#d1fae5', action: () => exportToCSV(byProp, 'occupancy_report.csv') },
          { label: 'Host Performance', sub: 'Top earning hosts', icon: '📋', color: '#fef3c7', action: () => exportToCSV(hosts, 'host_performance_report.csv') },
        ].map(r => (
          <div key={r.label} className="card" onClick={r.action} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, background: r.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{r.icon}</div>
            <div><div style={{ fontWeight: 700, fontSize: 14 }}>{r.label}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.sub}</div></div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading report data...</div>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            {/* Monthly revenue chart */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Revenue</h3>
              {chartMonthly.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>No monthly data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartMonthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => [`Rs.${Number(v).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue by type pie */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Revenue by Property Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [`Rs.${Number(v).toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Host Payouts Table */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Host Payout Report</h3>
            {hosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>No host payouts found.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Host Name</th>
                      <th>Total Earnings</th>
                      <th>Bookings</th>
                      <th>Avg per Booking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hosts.slice(0, 10).map((h, i) => {
                      const earnings = Number(h.total_earnings || h.total_paid || h.amount || 0);
                      const bookingCount = Number(h.booking_count || h.bookings || 1);
                      return (
                        <tr key={i}>
                          <td>
                            <div style={{ width: 28, height: 28, background: i < 3 ? 'var(--primary)' : '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i < 3 ? 'white' : 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                              {i + 1}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{h.host_name || h.name || `Host #${h.host_id}`}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent)' }}>Rs.{earnings.toLocaleString()}</td>
                          <td>{bookingCount}</td>
                          <td>Rs.{bookingCount > 0 ? Math.round(earnings / bookingCount).toLocaleString() : 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Refunds */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Refund Activity</h3>
            {refunds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>No recent refunds.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Booking</th><th>Amount</th><th>Date</th><th>Reason</th></tr></thead>
                  <tbody>
                    {refunds.map((r, i) => (
                      <tr key={i}>
                        <td>#{r.booking_id}</td>
                        <td style={{ color: '#dc2626', fontWeight: 600 }}>- Rs.{Number(r.amount || r.refunded || 0).toLocaleString()}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.refund_date?.substring(0, 10) || r.created_at?.substring(0, 10)}</td>
                        <td style={{ fontSize: 13 }}>{r.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <div className="grid-2">
        <button className="btn-outline" onClick={() => window.print()} style={{ justifyContent: 'center', padding: 14, display: 'flex', gap: 8 }}><Download size={14} /> Export as PDF</button>
        <button className="btn-outline" onClick={() => exportToCSV(byProp, 'admin_properties_report.csv')} style={{ justifyContent: 'center', padding: 14, display: 'flex', gap: 8 }}><Download size={14} /> Export as CSV</button>
      </div>
    </DashboardLayout>
  );
}
