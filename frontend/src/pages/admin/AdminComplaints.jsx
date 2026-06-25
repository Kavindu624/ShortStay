import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const load = () => { api.get('/complaints').then(r => setComplaints(r.data || [])).catch(() => {}); };
  useEffect(load, []);

  const update = async (id, status) => {
    try { await api.put(`/complaints/${id}`, { status }); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const prioBadge = { high: 'badge-error', medium: 'badge-warning', low: 'badge-info' };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Complaints</div><div className="page-subtitle">Manage guest complaints</div></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Booking</th><th>Description</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {complaints.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No complaints</td></tr>
                : complaints.map(c => (
                  <tr key={c.complaint_id}>
                    <td>#{c.complaint_id}</td>
                    <td>#{c.booking_id}</td>
                    <td style={{ maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div></td>
                    <td><span className={`badge ${prioBadge[c.priority] || 'badge-gray'}`}>{c.priority}</span></td>
                    <td><span className={`badge ${c.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {c.status !== 'resolved' && <button className="btn-success btn-sm" onClick={() => update(c.complaint_id, 'resolved')}>Resolve</button>}
                        {c.status !== 'closed' && <button className="btn-gray btn-sm" onClick={() => update(c.complaint_id, 'closed')}>Close</button>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
