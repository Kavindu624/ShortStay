import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { getImageUrl } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Home, Calendar, Star, Plus, MapPin } from 'lucide-react';

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec'];

export default function HostDashboard() {
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/properties/host/my-properties').then(r => setProperties(r.data || [])).catch(() => {});
    api.get('/bookings/host').then(r => setBookings(r.data || [])).catch(() => {});
  }, []);

  const totalEarnings = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + Number(b.total_price || 0), 0);
  const upcomingCheckins = bookings.filter(b => b.status === 'confirmed' && new Date(b.checkin_date) >= new Date()).length;
  const avgRating = properties.reduce((s, p) => s + Number(p.overall_score || 0), 0) / (properties.length || 1);

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    earnings: Math.round(totalEarnings / 6 * (0.7 + Math.random() * 0.6))
  }));

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Host</div><div className="page-subtitle">Manage host accounts</div></div>

      <div className="stats-grid">
        {[
          { label: 'Total Earnings', value: `${totalEarnings.toLocaleString()} LKR`, icon: DollarSign, sub: '↗ 18% vs last month' },
          { label: 'Active Listings', value: properties.filter(p => p.is_approved).length, icon: Home },
          { label: 'Upcoming Check-ins', value: upcomingCheckins, icon: Calendar },
          { label: 'Average Rating', value: avgRating.toFixed(1), icon: Star, sub: '↗ 5% vs last month' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              {s.sub && <div className="stat-sub">{s.sub}</div>}
            </div>
            <div className="stat-icon"><s.icon size={20} /></div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700 }}>Monthly Earnings</h3>
          <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>↗ +18% this month</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip formatter={v => [`Rs.${v.toLocaleString()}`, 'Earnings']} />
            <Bar dataKey="earnings" fill="#10b981" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Properties */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700 }}>My Properties</h3>
          <button className="btn-primary btn-sm" onClick={() => nav('/host/listings/new')}><Plus size={12} /> Add New Property</button>
        </div>
        {properties.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No properties yet.</p>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {properties.map(p => (
              <div key={p.property_id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 130, background: '#e5e7eb' }}>
                  {p.image ? <img src={getImageUrl(p.image)} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e3a8a22,#1e3a8a44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🏠</div>}
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}><MapPin size={11} color="var(--text-muted)" /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.address?.split(',')[0]}</span></div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{p.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={11} color="#f59e0b" fill="#f59e0b" />{p.overall_score || '—'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Rs.{Number(p.price_per_night).toLocaleString()}/night</span>
                  </div>
                  <button className="btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => nav(`/host/listings/edit/${p.property_id}`)}>Manage</button>
                </div>
              </div>
            ))}
          </div>}
      </div>

      {/* Upcoming check-ins */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Upcoming Check-ins</h3>
        {bookings.filter(b => b.status === 'confirmed' && new Date(b.checkin_date) >= new Date()).length === 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No upcoming check-ins.</p>
          : bookings.filter(b => b.status === 'confirmed' && new Date(b.checkin_date) >= new Date()).slice(0, 3).map(b => (
            <div key={b.booking_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{b.User?.name || `Guest #${b.guest_id}`}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.Property?.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.checkin_date} - {b.checkout_date}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>Rs.{Number(b.total_price).toLocaleString()}</div>
            </div>
          ))}
      </div>
    </DashboardLayout>
  );
}
