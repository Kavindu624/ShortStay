import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { ClipboardList, CheckCircle, XCircle, Clock, Upload } from 'lucide-react';

const statusBadge = { pending: 'badge-warning', completed: 'badge-success', rejected: 'badge-error', passed: 'badge-success', failed: 'badge-error' };

export default function InspectorDashboard() {
  const [tab, setTab] = useState('assigned');
  const [inspections, setInspections] = useState([]);
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ property_id: '', result: 'passed', notes: '' });
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState({});

  const loadAll = () => {
    api.get('/inspector').then(r => setInspections(r.data || [])).catch(() => {});
    // Backend returns { total, properties: [...] } for pending
    api.get('/inspector/pending').then(r => setPending(r.data?.properties || r.data || [])).catch(() => {});
    api.get('/inspector/dashboard').then(r => setStats(r.data)).catch(() => {});
  };
  useEffect(loadAll, []);

  const submit = async e => {
    e.preventDefault(); setMsg('');
    try {
      await api.post('/inspector/submit', {
        property_id: Number(form.property_id),
        result: form.result,
        notes: form.notes,
      });
      setMsg('Inspection submitted!');
      loadAll();
      setForm({ property_id: '', result: 'passed', notes: '' });
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const approveBadge = async (propertyId) => {
    try { await api.put(`/inspector/badge/${propertyId}`); alert('Badge approved!'); loadAll(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const uploadImages = async (inspectionId, files) => {
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('images', f));
    setUploading(prev => ({ ...prev, [inspectionId]: true }));
    try {
      await api.post(`/inspector/${inspectionId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Images uploaded!');
    } catch (err) { alert(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(prev => ({ ...prev, [inspectionId]: false })); }
  };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Inspections</div><div className="page-subtitle">Submit and manage property inspections</div></div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Assigned', value: stats.assigned ?? '—', icon: ClipboardList },
            { label: 'Completed', value: stats.completed ?? '—', icon: CheckCircle },
            { label: 'Pending', value: stats.pending ?? '—', icon: Clock },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
              <div className="stat-icon"><s.icon size={20} /></div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['assigned', 'My Inspections'], ['pending', 'Pending Properties']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1.5px solid', borderColor: tab === key ? 'var(--primary)' : 'var(--border)', background: tab === key ? 'var(--primary)' : 'white', color: tab === key ? 'white' : 'var(--text-muted)', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* List */}
        <div className="card">
          {tab === 'assigned' ? (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>My Inspections</h3>
              {inspections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <ClipboardList size={36} style={{ marginBottom: 10, opacity: 0.4 }} /><p>No inspections assigned.</p>
                </div>
              ) : inspections.map(i => (
                <div key={i.inspection_id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600 }}>{i.Property?.title || i.property?.title || `Property #${i.property_id}`}</span>
                    </div>
                    <span className={`badge ${statusBadge[i.status] || statusBadge[i.result] || 'badge-gray'}`}>{i.result || i.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Date: {i.scheduled_date || i.created_at?.substring(0, 10)} | Score: {i.overall_score || '—'}
                  </div>
                  {i.notes && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{i.notes}</p>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {(i.result === 'passed' || i.status === 'completed') && (
                      <button className="btn-success btn-sm" onClick={() => approveBadge(i.property_id)}>Approve Badge</button>
                    )}
                    <label className="btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Upload size={12} /> {uploading[i.inspection_id] ? 'Uploading...' : 'Upload Images'}
                      <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                        onChange={e => uploadImages(i.inspection_id, e.target.files)} />
                    </label>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Properties Pending Inspection</h3>
              {pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <CheckCircle size={36} style={{ marginBottom: 10, opacity: 0.4 }} /><p>No properties pending inspection.</p>
                </div>
              ) : pending.map(p => (
                <div key={p.property_id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{p.title || `Property #${p.property_id}`}</span>
                    <span className="badge badge-warning">{p.verification_status || 'pending'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.address}</div>
                  <button className="btn-primary btn-sm" style={{ marginTop: 8 }}
                    onClick={() => setForm(prev => ({ ...prev, property_id: String(p.property_id) }))}>
                    Fill Report
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Submit form */}
        <div className="card" style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Submit Inspection</h3>
          {msg && <div className={`alert ${msg.includes('submitted') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Property ID</label>
              <input className="form-input" type="number" placeholder="Property ID" value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Result</label>
              <select className="form-input" value={form.result} onChange={e => setForm({ ...form, result: e.target.value })}>
                <option value="passed">Passed ✓</option>
                <option value="failed">Failed ✗</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes / Observations</label>
              <textarea className="form-input" rows={4} placeholder="Describe findings, safety standards, cleanliness..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} required style={{ resize: 'vertical' }} />
            </div>
            <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Submit Inspection</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
