import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { AlertCircle, CheckCircle, Plus, ChevronDown } from 'lucide-react';

const prioBadge = { high: 'badge-error', medium: 'badge-warning', low: 'badge-info' };
const statusBadge = { open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-gray' };

export default function GuestComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ booking_id: '', subject: '', description: '', priority: 'medium' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    // Load guest's own complaints — backend filters by authenticated user
    api.get('/complaints/my').then(r => setComplaints(r.data || [])).catch(() => setComplaints([])).finally(() => setLoading(false));
    api.get('/bookings/my').then(r => setBookings((r.data?.bookings || r.data || []).filter(b => ['confirmed', 'completed'].includes(b.status)))).catch(() => {});
  };
  useEffect(load, []);

  const submit = async e => {
    e.preventDefault(); setMsg('');
    try {
      await api.post('/complaints', {
        booking_id: Number(form.booking_id),
        subject: form.subject,
        description: form.description,
        priority: form.priority,
      });
      setMsg('Complaint submitted successfully!');
      setShowForm(false);
      setForm({ booking_id: '', subject: '', description: '', priority: 'medium' });
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to submit complaint'); }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">My Complaints</div><div className="page-subtitle">Track issues with your bookings</div></div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> New Complaint
        </button>
      </div>

      {msg && <div className={`alert ${msg.includes('successfully') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msg}</div>}

      {/* New complaint form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: '1.5px solid var(--primary)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Submit a Complaint</h3>
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Select Booking</label>
              <select className="form-input" value={form.booking_id} onChange={e => setForm({ ...form, booking_id: e.target.value })} required>
                <option value="">-- Select a booking --</option>
                {bookings.map(b => (
                  <option key={b.booking_id} value={b.booking_id}>
                    {b.Property?.title || `Booking #${b.booking_id}`} — {b.checkin_date} ({b.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" placeholder="e.g. Property not as described" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={4} placeholder="Describe your issue in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" type="submit">Submit Complaint</button>
              <button className="btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Complaints list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <CheckCircle size={44} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 15 }}>No complaints filed</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Your experience has been smooth! If you encounter any issues, click "New Complaint" above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {complaints.map(c => (
            <div key={c.complaint_id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.subject}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Booking #{c.booking_id} • Filed {c.created_at?.substring(0, 10)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span className={`badge ${prioBadge[c.priority] || 'badge-gray'}`}>{c.priority}</span>
                  <span className={`badge ${statusBadge[c.status] || 'badge-gray'}`}>{c.status?.replace('_', ' ')}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: c.resolution ? 10 : 0 }}>{c.description}</p>
              {(c.resolution_note || c.resolution) && (
                <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 14px', marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Admin Resolution</div>
                  <p style={{ fontSize: 13, margin: 0 }}>{c.resolution_note || c.resolution}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
