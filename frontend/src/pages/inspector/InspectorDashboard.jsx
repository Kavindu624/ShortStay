import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { ClipboardList } from 'lucide-react';

export default function InspectorDashboard() {
  const [inspections, setInspections] = useState([]);
  const [form, setForm] = useState({ property_id: '', scheduled_date: '', overall_score: '', recommendation: '' });
  const [msg, setMsg] = useState('');

  const load = () => { api.get('/inspector').then(r => setInspections(r.data || [])).catch(() => {}); };
  useEffect(load, []);

  const submit = async e => {
    e.preventDefault(); setMsg('');
    try { await api.post('/inspector', form); setMsg('Inspection submitted!'); load(); setForm({ property_id: '', scheduled_date: '', overall_score: '', recommendation: '' }); }
    catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const approveBadge = async (propertyId) => {
    try { await api.put(`/inspector/badge/${propertyId}`); alert('Badge approved!'); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const statusBadge = { pending: 'badge-warning', completed: 'badge-success', rejected: 'badge-error' };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Inspections</div><div className="page-subtitle">Submit and manage property inspections</div></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* List */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>My Inspections</h3>
          {inspections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}><ClipboardList size={36} style={{ marginBottom: 10, opacity: 0.4 }} /><p>No inspections assigned.</p></div>
          ) : inspections.map(i => (
            <div key={i.inspection_id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>Property #{i.property_id}</span>
                <span className={`badge ${statusBadge[i.status] || 'badge-gray'}`}>{i.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Date: {i.scheduled_date} | Score: {i.overall_score || '—'}</div>
              {i.recommendation && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{i.recommendation}</p>}
              {i.status === 'completed' && <button className="btn-success btn-sm" onClick={() => approveBadge(i.property_id)}>Approve Badge</button>}
            </div>
          ))}
        </div>

        {/* Submit form */}
        <div className="card" style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Submit Inspection</h3>
          {msg && <div className={`alert ${msg.includes('submitted') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={submit}>
            <div className="form-group"><label className="form-label">Property ID</label><input className="form-input" type="number" placeholder="Property ID" value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Scheduled Date</label><input className="form-input" type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Overall Score (0–5)</label><input className="form-input" type="number" step="0.01" min="0" max="5" placeholder="4.5" value={form.overall_score} onChange={e => setForm({ ...form, overall_score: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Recommendation</label><textarea className="form-input" rows={3} placeholder="Inspection notes..." value={form.recommendation} onChange={e => setForm({ ...form, recommendation: e.target.value })} style={{ resize: 'vertical' }} /></div>
            <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Submit Inspection</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
