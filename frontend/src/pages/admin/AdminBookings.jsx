import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Calendar } from 'lucide-react';

const statusBadge = { completed: 'badge-success', confirmed: 'badge-success', approved: 'badge-info', pending: 'badge-warning', cancelled: 'badge-error', rejected: 'badge-error' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    // Try admin reports endpoint for booking overview
    api.get('/admin/reports/bookings')
      .then(r => setBookings(r.data?.data || r.data?.bookings || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title">Bookings</div>
        <div className="page-subtitle">Platform booking overview</div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div><div className="stat-label">Total Bookings</div><div className="stat-value">{totalBookings}</div></div>
          <div className="stat-icon"><span style={{ fontSize: 20 }}>📅</span></div>
        </div>
        <div className="stat-card">
          <div><div className="stat-label">Confirmed</div><div className="stat-value">{confirmedBookings}</div></div>
          <div className="stat-icon"><span style={{ fontSize: 20 }}>✅</span></div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Guest</th><th>Property</th><th>Check-in</th><th>Check-out</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found</td></tr>
              ) : bookings.map(b => (
                <tr key={b.booking_id}>
                  <td>#{b.booking_id}</td>
                  <td>{b.guest?.name || b.User?.name || (typeof b.guest === 'string' ? b.guest : `Guest #${b.guest_id || 'Unknown'}`)}</td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.Property?.title || b.property?.title || (typeof b.property === 'string' ? b.property : `Property #${b.property_id || 'Unknown'}`)}</td>
                  <td style={{ fontSize: 12 }}>{b.checkin_date}</td>
                  <td style={{ fontSize: 12 }}>{b.checkout_date}</td>
                  <td style={{ fontWeight: 700 }}>Rs.{Number(b.total_price).toLocaleString()}</td>
                  <td><span className={`badge ${statusBadge[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
