import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { ClipboardList, MapPin, RefreshCw, Send, Upload } from 'lucide-react';

export default function InspectorPending() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(null);
  const [form, setForm] = useState({ result: 'passed', notes: '' });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/inspector/pending')
      // Backend returns { total, properties: [...] }
      .then(r => setProperties(r.data?.properties || r.data || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openSubmit = (prop) => {
    setSubmitModal(prop);
    setForm({ result: 'passed', notes: '' });
    setImages([]);
    setMsg('');
  };

  const submitInspection = async () => {
    if (!form.notes.trim()) { setMsg('Please add inspection notes.'); return; }
    setSubmitting(true); setMsg('');
    try {
      const res = await api.post('/inspector/submit', {
        property_id: submitModal.property_id,
        result: form.result,
        notes: form.notes,
      });
      // Upload images if any
      if (images.length > 0 && res.data?.inspection?.inspection_id) {
        const fd = new FormData();
        images.forEach(img => fd.append('images', img));
        await api.post(`/inspector/${res.data.inspection.inspection_id}/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setMsg('Inspection submitted successfully!');
      setTimeout(() => { setSubmitModal(null); load(); }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">Pending Inspections</div><div className="page-subtitle">Properties awaiting your inspection report</div></div>
        <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Submit modal */}
      {submitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Submit Inspection Report</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{submitModal.title} — {submitModal.address}</p>
            {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
            <div className="form-group">
              <label className="form-label">Inspection Result</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['passed', 'failed'].map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm(f => ({ ...f, result: r }))}
                    style={{
                      padding: '8px 20px', borderRadius: 8, fontWeight: 600, border: '2px solid',
                      borderColor: form.result === r ? (r === 'passed' ? '#10b981' : '#ef4444') : 'var(--border)',
                      background: form.result === r ? (r === 'passed' ? '#d1fae5' : '#fee2e2') : 'white',
                      color: form.result === r ? (r === 'passed' ? '#059669' : '#dc2626') : 'var(--text-muted)',
                      cursor: 'pointer', textTransform: 'capitalize',
                    }}>
                    {r === 'passed' ? '✓ Passed' : '✗ Failed'}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Inspection Notes <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea className="form-input" rows={4}
                placeholder="Describe your findings — safety standards, cleanliness, amenities condition, etc."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Evidence Photos (optional, max 5)</label>
              <input type="file" accept="image/*" multiple
                onChange={e => setImages(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5))}
                style={{ display: 'none' }} id="inspImgUpload" />
              <label htmlFor="inspImgUpload" className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Upload size={14} /> Upload Photos
              </label>
              {images.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>{images.length} photo(s) selected</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={submitInspection} disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button className="btn-outline" onClick={() => setSubmitModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <ClipboardList size={44} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>No pending inspections</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>All properties have been inspected.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {properties.map(p => (
            <div key={p.property_id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>
                  <MapPin size={11} /> {p.address}
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Type: <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{p.property_type || 'N/A'}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Max Guests: <strong style={{ color: 'var(--text-main)' }}>{p.max_guests}</strong></span>
                  <span className={`badge ${p.verification_status === 'inspecting' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                    {p.verification_status || 'pending'}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginLeft: 20 }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>Rs.{Number(p.price_per_night).toLocaleString()}/night</div>
                <button className="btn-primary btn-sm" onClick={() => openSubmit(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ClipboardList size={12} /> Submit Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
