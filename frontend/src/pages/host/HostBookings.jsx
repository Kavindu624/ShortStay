import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Calendar } from 'lucide-react';

const statusBadge = { confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-error' };

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(10); // default 10%

  const load = () => {
    Promise.all([
      api.get('/bookings/host'),
      api.get('/settings').catch(() => ({ data: {} })) // fallback if fails
    ]).then(([bookingsRes, settingsRes]) => {
      setBookings(bookingsRes.data || []);
      if (settingsRes.data?.commissionRate) {
        setCommissionRate(Number(settingsRes.data.commissionRate));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };
  
  useEffect(load, []);

  const approve = async (id) => {
    try { await api.put(`/bookings/${id}/approve`); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const reject = async (id) => {
    if (!confirm('Reject this booking?')) return;
    try { await api.put(`/bookings/${id}/reject`); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };

  const calculateNights = (checkin, checkout) => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Bookings</div><div className="page-subtitle">Manage reservations for your properties</div></div>
      
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Total Bookings</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>{stats.total}</div>
          </div>
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Confirmed</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{stats.confirmed}</div>
          </div>
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Pending</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
          </div>
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Completed</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{stats.completed}</div>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
        : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Calendar size={40} style={{ marginBottom: 12, opacity: 0.4 }} /><p>No bookings yet.</p>
          </div>
        ) : (
          <div className="card">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 16 }}>All Bookings</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th style={{ width: '5%' }}>Booking ID</th><th>Guest</th><th>Property</th><th style={{ whiteSpace: 'nowrap' }}>Check-in</th><th style={{ whiteSpace: 'nowrap' }}>Check-out</th><th>Nights</th><th>Your Earning</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.map(b => {
                    const isCancelledOrRejected = b.status === 'cancelled' || b.status === 'rejected';
                    const total = isCancelledOrRejected ? 0 : Number(b.total_price);
                    const fee = total * (commissionRate / 100);
                    const earning = total - fee;
                    return (
                      <tr key={b.booking_id}>
                        <td style={{ fontWeight: 600 }}>{b.booking_id}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>{b.guest?.name || `Guest #${b.guest_id}`}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.guest?.email || 'N/A'}</div>
                        </td>
                        <td>{b.property?.title || `Property #${b.property_id}`}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{b.checkin_date}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{b.checkout_date}</td>
                        <td>{calculateNights(b.checkin_date, b.checkout_date)}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: isCancelledOrRejected ? 'var(--text-muted)' : '#10b981', marginBottom: 2, textDecoration: isCancelledOrRejected ? 'line-through' : 'none' }}>
                            {earning.toLocaleString()} LKR
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Fee: {fee.toLocaleString()} LKR</div>
                        </td>
                        <td><span className={`badge ${statusBadge[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {b.status === 'pending' && <button className="btn-success btn-sm" onClick={() => approve(b.booking_id)}>Approve</button>}
                            {b.status === 'pending' && <button className="btn-danger btn-sm" onClick={() => reject(b.booking_id)}>Reject</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
