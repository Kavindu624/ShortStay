import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Calendar } from 'lucide-react';

const statusBadge = { confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-error' };

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => { api.get('/bookings/host').then(r => setBookings(r.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const approve = async (id) => {
    try { await api.put(`/bookings/${id}/approve`); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const reject = async (id) => {
    if (!confirm('Reject this booking?')) return;
    try { await api.put(`/bookings/${id}/reject`); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Bookings</div><div className="page-subtitle">Manage property bookings</div></div>
      {loading ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
        : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Calendar size={40} style={{ marginBottom: 12, opacity: 0.4 }} /><p>No bookings yet.</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Booking</th><th>Guest</th><th>Property</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.booking_id}>
                      <td style={{ fontWeight: 600 }}>#{b.booking_id}</td>
                      <td>{b.guest?.name || `Guest #${b.guest_id}`}</td>
                      <td>{b.property?.title || `Property #${b.property_id}`}</td>
                      <td>{b.checkin_date}</td>
                      <td>{b.checkout_date}</td>
                      <td style={{ fontWeight: 600 }}>Rs.{Number(b.total_price).toLocaleString()}</td>
                      <td><span className={`badge ${statusBadge[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {b.status === 'pending' && <button className="btn-success btn-sm" onClick={() => approve(b.booking_id)}>Approve</button>}
                          {b.status === 'pending' && <button className="btn-danger btn-sm" onClick={() => reject(b.booking_id)}>Reject</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
