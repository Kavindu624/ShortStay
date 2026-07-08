import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { showAlert } from '../../utils/alert';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

const statusBadge = { confirmed: 'badge-success', approved: 'badge-info', pending: 'badge-warning', cancelled: 'badge-error' };

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [commissionRate, setCommissionRate] = useState(10); // default 10%
  const [rejectModal, setRejectModal] = useState(null);
  const [completeModal, setCompleteModal] = useState(null);

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
    try { await api.put(`/bookings/${id}/approve`); load(); } catch (err) { showAlert(err.response?.data?.message || 'Failed'); }
  };

  const confirmReject = async () => {
    if (!rejectModal) return;
    try { await api.put(`/bookings/${rejectModal}/reject`); load(); setRejectModal(null); } catch (err) { showAlert(err.response?.data?.message || 'Failed'); }
  };

  const confirmComplete = async () => {
    if (!completeModal) return;
    try { await api.put(`/bookings/${completeModal}/complete`); load(); setCompleteModal(null); } catch (err) { showAlert(err.response?.data?.message || 'Failed'); }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const calculateNights = (checkin, checkout) => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Bookings</div><div className="page-subtitle">Manage reservations for your properties</div></div>
      
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="card" onClick={() => setFilter('all')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', border: filter === 'all' ? '2px solid var(--primary)' : '1px solid transparent', transition: 'all 0.2s' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Total Bookings</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>{stats.total}</div>
          </div>
          <div className="card" onClick={() => setFilter('pending')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', border: filter === 'pending' ? '2px solid #f59e0b' : '1px solid transparent', transition: 'all 0.2s' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Pending</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
          </div>
          <div className="card" onClick={() => setFilter('approved')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', border: filter === 'approved' ? '2px solid #3b82f6' : '1px solid transparent', transition: 'all 0.2s' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Approved (Unpaid)</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{stats.approved}</div>
          </div>
          <div className="card" onClick={() => setFilter('confirmed')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', border: filter === 'confirmed' ? '2px solid #10b981' : '1px solid transparent', transition: 'all 0.2s' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Confirmed (Paid)</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{stats.confirmed}</div>
          </div>
          <div className="card" onClick={() => setFilter('completed')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', border: filter === 'completed' ? '2px solid #6366f1' : '1px solid transparent', transition: 'all 0.2s' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Completed</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#6366f1' }}>{stats.completed}</div>
          </div>
          <div className="card" onClick={() => setFilter('rejected')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', border: filter === 'rejected' ? '2px solid #ef4444' : '1px solid transparent', transition: 'all 0.2s' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Rejected</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{stats.rejected}</div>
          </div>
          <div className="card" onClick={() => setFilter('cancelled')} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer', border: filter === 'cancelled' ? '2px solid #6b7280' : '1px solid transparent', transition: 'all 0.2s' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>Cancelled</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#6b7280' }}>{stats.cancelled}</div>
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
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 16 }}>
              {filter === 'all' ? 'All Bookings' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`}
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th style={{ width: '5%' }}>ID</th><th>Guest</th><th>Property</th><th style={{ whiteSpace: 'nowrap' }}>Dates</th><th>Nights</th><th>Earnings</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No {filter !== 'all' ? filter : ''} bookings found.</td></tr>
                  ) : filteredBookings.map(b => {
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
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 2 }}>In: {b.checkin_date}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-main)' }}>Out: {b.checkout_date}</div>
                        </td>
                        <td>{calculateNights(b.checkin_date, b.checkout_date)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, color: isCancelledOrRejected ? 'var(--text-muted)' : '#10b981', marginBottom: 2, textDecoration: isCancelledOrRejected ? 'line-through' : 'none' }}>
                            {earning.toLocaleString()} LKR
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Fee: {fee.toLocaleString()} LKR</div>
                        </td>
                        <td><span className={`badge ${statusBadge[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {b.status === 'pending' && <button className="btn-success btn-sm" onClick={() => approve(b.booking_id)} style={{ whiteSpace: 'nowrap' }}>Approve</button>}
                            {b.status === 'pending' && <button className="btn-danger btn-sm" onClick={() => setRejectModal(b.booking_id)} style={{ whiteSpace: 'nowrap' }}>Reject</button>}
                            {b.status === 'confirmed' && <button className="btn-primary btn-sm" onClick={() => setCompleteModal(b.booking_id)} style={{ whiteSpace: 'nowrap' }}>Mark Completed</button>}
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

      {/* Reject Booking Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111827' }}>Reject Booking?</h2>
            <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to reject this booking? This will cancel the reservation request.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={confirmReject} style={{ flex: 1, background: '#ef4444', justifyContent: 'center' }}>
                Yes, Reject
              </button>
              <button className="btn-outline" onClick={() => setRejectModal(null)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Booking Modal */}
      {completeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={24} color="#10b981" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111827' }}>Mark as Completed?</h2>
            <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Mark this booking as completed? Only do this after the guest has successfully checked out.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={confirmComplete} style={{ flex: 1, background: '#10b981', justifyContent: 'center' }}>
                Yes, Complete
              </button>
              <button className="btn-outline" onClick={() => setCompleteModal(null)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
