import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Users, Building2, DollarSign, BarChart3, AlertCircle, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    api.get('/dashboard/admin').then(r => setStats(r.data)).catch(() => {});
    // Pull real monthly data from reports endpoint
    api.get('/payments/reports/monthly')
      .then(r => {
        const data = (r.data?.data || r.data || []).map(m => ({
          month: m.month || m.period || m.year_month || '?',
          revenue: Number(m.total_revenue || m.revenue || m.amount || 0),
          bookings: Number(m.booking_count || m.bookings || m.payments || 0),
        }));
        setMonthlyData(data);
      })
      .catch(() => {});
  }, []);

  // Normalize stats from backend
  const totalUsers = stats?.user_stats?.total ?? 0;
  const totalProperties = stats?.property_stats?.total ?? 0;
  const totalBookings = stats?.booking_stats?.total ?? 0;
  const totalRevenue = stats?.payment_stats?.total_revenue ?? 0;
  const pendingApprovals = stats?.property_stats?.pending_approvals ?? 0;
  const openComplaints = stats?.complaint_stats?.open ?? 0;
  const activeInspections = stats?.active_inspections ?? 0;

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Admin Dashboard</div><div className="page-subtitle">Platform overview and statistics</div></div>

      <div className="stats-grid">
        {[
          { label: 'Total Users', value: totalUsers, icon: Users },
          { label: 'Total Properties', value: totalProperties, icon: Building2 },
          { label: 'Total Bookings', value: totalBookings, icon: BarChart3 },
          { label: 'Total Revenue', value: `Rs.${Number(totalRevenue).toLocaleString()}`, icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
            <div className="stat-icon"><s.icon size={20} /></div>
          </div>
        ))}
      </div>

      {/* Action items */}
      {(pendingApprovals > 0 || openComplaints > 0 || activeInspections > 0) && (
        <div className="stats-grid" style={{ marginTop: 12 }}>
          {pendingApprovals > 0 && (
            <div className="card" style={{ border: '1.5px solid #fef3c7', background: '#fffbeb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={20} color="#f59e0b" />
                <div><div style={{ fontWeight: 700 }}>{pendingApprovals} Pending Approvals</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Properties awaiting review</div></div>
              </div>
            </div>
          )}
          {openComplaints > 0 && (
            <div className="card" style={{ border: '1.5px solid #fee2e2', background: '#fff1f1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={20} color="#ef4444" />
                <div><div style={{ fontWeight: 700 }}>{openComplaints} Open Complaints</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Require attention</div></div>
              </div>
            </div>
          )}
          {activeInspections > 0 && (
            <div className="card" style={{ border: '1.5px solid #dbeafe', background: '#eff6ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClipboardList size={20} color="#1e3a8a" />
                <div><div style={{ fontWeight: 700 }}>{activeInspections} Active Inspections</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>In progress</div></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Bookings</h3>
          {monthlyData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Revenue Trend</h3>
          {monthlyData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => [`Rs.${Number(v).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
