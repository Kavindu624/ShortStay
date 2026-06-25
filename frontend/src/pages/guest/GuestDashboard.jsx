import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Calendar, MapPin, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../AuthContext';

export default function GuestDashboard() {
  const [bookings, setBookings] = useState([]);
  const [membership, setMembership] = useState(null);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data || [])).catch(() => {});
    api.get('/auth/membership').then(r => setMembership(r.data)).catch(() => {});
  }, []);

  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.checkin_date) >= new Date());
  const past = bookings.filter(b => b.status === 'confirmed' && new Date(b.checkin_date) < new Date());
  const totalSpent = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + Number(b.total_price), 0);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title">Guest</div>
        <div className="page-subtitle">manage guest bookings</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Upcoming Trips', value: upcoming.length, icon: '📅', color: '#1e3a8a' },
          { label: 'Past Trips', value: past.length, icon: '📍', color: '#1e3a8a' },
          { label: 'Total Spent', value: `${totalSpent.toLocaleString()} LKR`, icon: '⭐', color: '#1e3a8a' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
            <div className="stat-icon" style={{ background: s.color }}><span style={{ fontSize: 20 }}>{s.icon}</span></div>
          </div>
        ))}
      </div>

      {/* Upcoming trips */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Upcoming Trips</h3>
        {upcoming.length === 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No upcoming trips.</p>
          : upcoming.map(b => (
              <div key={b.booking_id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{b.Property?.title || `Booking #${b.booking_id}`}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{b.Property?.address}</div>
                  <div style={{ fontSize: 12, marginTop: 6, color: 'var(--text-muted)' }}>
                    <span>Check-in <strong style={{ color: 'var(--text-main)' }}>{b.checkin_date}</strong></span>
                    <span style={{ margin: '0 12px' }}>Check-out <strong style={{ color: 'var(--text-main)' }}>{b.checkout_date}</strong></span>
                    <span>Nights <strong style={{ color: 'var(--text-main)' }}>{Math.ceil((new Date(b.checkout_date) - new Date(b.checkin_date)) / 86400000)}</strong></span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Total {Number(b.total_price).toLocaleString()}</div>
                  <button className="btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => nav(`/guest/bookings/${b.booking_id}`)}>View Details</button>
                </div>
              </div>
            ))}
      </div>

      {/* Membership */}
      {membership && (
        <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Membership: {membership.membership_level?.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{membership.bookings_needed > 0 ? `${membership.bookings_needed} more bookings to reach ${membership.next_level}` : membership.next_level}</div>
            </div>
            <Star size={32} color="#f59e0b" fill="#f59e0b" />
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg,#eff6ff,#f5f6fa)' }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>Ready for Your Next Adventure?</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Browse thousands of properties worldwide</div>
        </div>
        <button className="btn-primary" onClick={() => nav('/guest/browse')}>Explore Listings <ArrowRight size={15} /></button>
      </div>
    </DashboardLayout>
  );
}
