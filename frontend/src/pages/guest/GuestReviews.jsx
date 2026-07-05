import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Star, Pencil, Trash2, Plus, X } from 'lucide-react';

function StarRating({ value, onChange, readonly }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button"
          onClick={() => !readonly && onChange && onChange(n)}
          style={{ background: 'none', padding: 2, cursor: readonly ? 'default' : 'pointer', border: 'none' }}>
          <Star size={readonly ? 14 : 22} color="#f59e0b" fill={n <= value ? '#f59e0b' : 'none'} />
        </button>
      ))}
    </div>
  );
}

export default function GuestReviews() {
  const [myReviews, setMyReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // review being edited
  const [form, setForm] = useState({ booking_id: '', property_id: '', rating: 5, comment: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/reviews/my')
      .then(r => setMyReviews(r.data?.reviews || r.data || []))
      .catch(() => setMyReviews([]))
      .finally(() => setLoading(false));
    api.get('/bookings/my')
      .then(r => setBookings((r.data?.bookings || r.data || []).filter(b => b.status === 'completed')))
      .catch(() => {});
  };
  useEffect(load, []);

  const resetForm = () => {
    setForm({ booking_id: '', property_id: '', rating: 5, comment: '' });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (review) => {
    setEditing(review.review_id);
    setForm({
      booking_id: review.booking_id || '',
      property_id: review.property_id || '',
      rating: review.rating || 5,
      comment: review.comment || '',
    });
    setShowForm(true);
    setMsg('');
  };

  const submit = async e => {
    e.preventDefault(); setMsg('');
    try {
      if (editing) {
        await api.put(`/reviews/${editing}`, { rating: form.rating, comment: form.comment });
        setMsg('Review updated!');
      } else {
        await api.post('/reviews', {
          booking_id: Number(form.booking_id),
          property_id: Number(form.property_id),
          rating: form.rating,
          comment: form.comment,
        });
        setMsg('Review submitted!');
      }
      resetForm();
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">My Reviews</div><div className="page-subtitle">Share and manage your experiences</div></div>
        {!showForm && (
          <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Write a Review
          </button>
        )}
      </div>

      {/* Write / Edit form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, maxWidth: 580, border: '1.5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit Review' : 'Write a Review'}</h3>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          {msg && <div className={`alert ${msg.includes('success') || msg.includes('submitted') || msg.includes('updated') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={submit}>
            {!editing && (
              <div className="form-group">
                <label className="form-label">Select Booking</label>
                <select className="form-input" value={form.booking_id} onChange={e => {
                  const b = bookings.find(x => x.booking_id == e.target.value);
                  setForm({ ...form, booking_id: e.target.value, property_id: b?.property_id || '' });
                }} required>
                  <option value="">-- Select a booking --</option>
                  {bookings.map(b => (
                    <option key={b.booking_id} value={b.booking_id}>
                      {b.Property?.title || `Booking #${b.booking_id}`} ({b.checkin_date})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Your Rating</label>
              <StarRating value={form.rating} onChange={n => setForm({ ...form, rating: n })} />
            </div>
            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea className="form-input" rows={4} placeholder="Share your experience with other guests..."
                value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                required style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {editing ? <><Pencil size={14} /> Update Review</> : <><Plus size={14} /> Submit Review</>}
              </button>
              <button className="btn-outline" type="button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* My reviews list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : myReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Star size={44} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 15 }}>No reviews yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>After completing a stay, share your experience with future guests.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 700 }}>
          {myReviews.map(r => (
            <div key={r.review_id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    {r.property?.title || `Property #${r.property_id}`}
                  </div>
                  <StarRating value={r.rating} readonly />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.review_date?.substring(0, 10)}</span>
                  <button className="btn-outline btn-sm" onClick={() => startEdit(r)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Pencil size={11} /> Edit
                  </button>
                  <button className="btn-danger btn-sm" onClick={() => deleteReview(r.review_id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{r.comment}</p>
              {r.host_response && (
                <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px', marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Host Response</div>
                  <p style={{ fontSize: 13, margin: 0 }}>{r.host_response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
