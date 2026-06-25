import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Calendar, CreditCard } from 'lucide-react';

const statusBadge = { confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-error', completed: 'badge-info' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const nav = useNavigate();

  const load = () => { api.get('/bookings/my').then(r => setBookings(r.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { await api.put(`/bookings/${id}/cancel`); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title">My Bookings</div>
        <div className="page-subtitle">Manage your reservations</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'pending', 'confirmed', 'cancelled'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1.5px solid', borderColor: tab === t ? 'var(--primary)' : 'var(--border)', background: tab === t ? 'var(--primary)' : 'white', color: tab === t ? 'white' : 'var(--text-muted)', cursor: 'pointer', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
        : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Calendar size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No bookings found.</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/guest/browse')}>Browse Properties</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(b => {
              const nights = Math.ceil((new Date(b.checkout_date) - new Date(b.checkin_date)) / 86400000);
              return (
                <div key={b.booking_id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{b.Property?.title || `Booking #${b.booking_id}`}</span>
                      <span className={`badge ${statusBadge[b.status] || 'badge-gray'}`}>{b.status}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>{b.Property?.address}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 20 }}>
                      <span>Check-in: <strong style={{ color: 'var(--text-main)' }}>{b.checkin_date}</strong></span>
                      <span>Check-out: <strong style={{ color: 'var(--text-main)' }}>{b.checkout_date}</strong></span>
                      <span>Nights: <strong style={{ color: 'var(--text-main)' }}>{nights}</strong></span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Rs.{Number(b.total_price).toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {b.status === 'confirmed' && (
                        <button className="btn-primary btn-sm" onClick={() => nav(`/guest/pay/${b.booking_id}`)}>
                          <CreditCard size={12} /> Pay
                        </button>
                      )}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button className="btn-danger btn-sm" onClick={() => cancel(b.booking_id)}>Cancel</button>
                      )}
                      {b.status === 'confirmed' && (
                        <button className="btn-outline btn-sm" onClick={() => nav(`/guest/review/${b.booking_id}/${b.property_id}`)}>Review</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
}
