import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Star } from 'lucide-react';

export default function GuestReviews() {
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ booking_id: '', property_id: '', rating: 5, comment: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get('/bookings/my').then(r => setBookings((r.data || []).filter(b => b.status === 'confirmed'))).catch(() => {}); }, []);

  const submit = async e => {
    e.preventDefault(); setMsg('');
    try {
      await api.post('/reviews', form);
      setMsg('Review submitted!');
      setForm({ booking_id: '', property_id: '', rating: 5, comment: '' });
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">My Reviews</div><div className="page-subtitle">Share your experience</div></div>
      <div style={{ maxWidth: 600 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Write a Review</h3>
          {msg && <div className={`alert ${msg.includes('submitted') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Select Booking</label>
              <select className="form-input" value={form.booking_id} onChange={e => {
                const b = bookings.find(x => x.booking_id == e.target.value);
                setForm({ ...form, booking_id: e.target.value, property_id: b?.property_id || '' });
              }} required>
                <option value="">-- Select a booking --</option>
                {bookings.map(b => <option key={b.booking_id} value={b.booking_id}>{b.Property?.title || `Booking #${b.booking_id}`} ({b.checkin_date})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} style={{ background: 'none', padding: 4 }}>
                    <Star size={24} color="#f59e0b" fill={n <= form.rating ? '#f59e0b' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea className="form-input" rows={4} placeholder="Share your experience..." value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} required style={{ resize: 'vertical' }} />
            </div>
            <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Submit Review</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
