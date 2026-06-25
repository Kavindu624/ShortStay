import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Users, Building2, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/dashboard').then(r => setStats(r.data)).catch(() => {}); }, []);

  const chartData = ['Jul','Aug','Sep','Oct','Nov','Dec'].map(m => ({ month: m, bookings: Math.floor(Math.random()*80+20), revenue: Math.floor(Math.random()*500000+200000) }));

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Dashboard</div><div className="page-subtitle">Platform overview and statistics</div></div>

      <div className="stats-grid">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users },
          { label: 'Total Properties', value: stats?.totalProperties || 0, icon: Building2 },
          { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: BarChart3 },
          { label: 'Total Revenue', value: `Rs.${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
            <div className="stat-icon"><s.icon size={20} /></div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Bookings</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#1e3a8a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
