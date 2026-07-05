import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [resolutionNote, setResolutionNote] = useState({});
  const [expanded, setExpanded] = useState(null);

  const load = () => { api.get('/complaints').then(r => setComplaints(r.data || [])).catch(() => {}); };
  useEffect(load, []);

  const update = async (id, status) => {
    try {
      await api.put(`/complaints/${id}`, { status, resolution_note: resolutionNote[id] || undefined });
      setResolutionNote(prev => ({ ...prev, [id]: '' }));
      setExpanded(null);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const prioBadge = { high: 'badge-error', medium: 'badge-warning', low: 'badge-info' };
  const statusBadge = { open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-gray' };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Complaints</div><div className="page-subtitle">Manage guest complaints and resolutions</div></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Booking</th><th>Subject</th><th>Description</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {complaints.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No complaints</td></tr>
                : complaints.map(c => (
                  <>
                    <tr key={c.complaint_id}>
                      <td>#{c.complaint_id}</td>
                      <td>#{c.booking_id}</td>
                      <td style={{ fontWeight: 600, maxWidth: 140 }}>{c.subject || '—'}</td>
                      <td style={{ maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div></td>
                      <td><span className={`badge ${prioBadge[c.priority] || 'badge-gray'}`}>{c.priority}</span></td>
                      <td><span className={`badge ${statusBadge[c.status] || 'badge-gray'}`}>{c.status?.replace('_', ' ')}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {c.status !== 'resolved' && c.status !== 'closed' && (
                            <button className="btn-success btn-sm" onClick={() => setExpanded(expanded === c.complaint_id ? null : c.complaint_id)}>
                              Resolve
                            </button>
                          )}
                          {c.status !== 'closed' && (
                            <button className="btn-gray btn-sm" onClick={() => update(c.complaint_id, 'closed')}>Close</button>
                          )}
                          {c.status === 'open' && (
                            <button className="btn-primary btn-sm" onClick={() => update(c.complaint_id, 'in_progress')}>In Progress</button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === c.complaint_id && (
                      <tr key={`${c.complaint_id}-resolve`}>
                        <td colSpan={7} style={{ background: '#f0fdf4', padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Resolution Note (optional)</div>
                          <textarea
                            className="form-input"
                            rows={2}
                            style={{ marginBottom: 8, resize: 'vertical', maxWidth: 500 }}
                            placeholder="Describe how this complaint was resolved..."
                            value={resolutionNote[c.complaint_id] || ''}
                            onChange={e => setResolutionNote(prev => ({ ...prev, [c.complaint_id]: e.target.value }))}
                          />
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-success btn-sm" onClick={() => update(c.complaint_id, 'resolved')}>Mark Resolved</button>
                            <button className="btn-outline btn-sm" onClick={() => setExpanded(null)}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
