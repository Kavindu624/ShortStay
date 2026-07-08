import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { showAlert } from '../../utils/alert';
import { Check, X, MapPin, UserPlus, ShieldCheck, Eye } from 'lucide-react';

const vBadge = {
  none: 'badge-gray',
  requested: 'badge-warning',
  inspecting: 'badge-info',
  approved: 'badge-success',
  rejected: 'badge-error',
  pending: 'badge-warning',
};

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [assignModal, setAssignModal] = useState(null); // property_id
  const [selectedInspector, setSelectedInspector] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [assignMsg, setAssignMsg] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    api.get('/admin/properties').then(r => setProperties(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    // Load list of verifiers for assignment dropdown
    api.get('/admin/users?role=verifier').then(r => {
      const users = r.data?.users || r.data || [];
      setInspectors(users.filter(u => u.role === 'verifier'));
    }).catch(() => {});
  }, []);

  const approve = async (id) => {
    try { await api.put(`/admin/properties/${id}/approve`); load(); }
    catch (err) { showAlert(err.response?.data?.message || 'Failed'); }
  };

  const openRejectModal = (id) => { setRejectModal(id); setRejectReason(''); };

  const rejectProperty = async () => {
    try {
      await api.put(`/admin/properties/${rejectModal}/reject`, { reason: rejectReason });
      setRejectModal(null);
      load();
    } catch (err) { showAlert(err.response?.data?.message || 'Failed'); }
  };

  const openAssignModal = (id) => { setAssignModal(id); setSelectedInspector(''); setScheduledDate(''); setAssignMsg(''); };

  const assignInspector = async () => {
    if (!selectedInspector || !scheduledDate) {
      showAlert('Please select a verifier and a scheduled date.');
      return;
    }
    try {
      await api.post('/inspector/assign', {
        property_id: Number(assignModal),
        inspector_id: Number(selectedInspector),
        scheduled_date: scheduledDate
      });
      setAssignMsg('Inspector assigned successfully!');
      setTimeout(() => { setAssignModal(null); load(); }, 1200);
    } catch (err) { setAssignMsg(err.response?.data?.message || 'Failed to assign inspector'); }
  };

  const filtered = tab === 'all'
    ? properties
    : tab === 'pending' ? properties.filter(p => !p.is_approved)
    : tab === 'approved' ? properties.filter(p => p.is_approved)
    : properties.filter(p => p.verification_status === tab);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">Properties</div><div className="page-subtitle">Manage and approve property listings</div></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {filtered.length} of {properties.length} properties
          </span>
        </div>
      </div>

      {/* Assign modal */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Assign Inspector</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{properties.find(p => p.property_id === assignModal)?.title || `Property #${assignModal}`}</p>
            {assignMsg && <div className={`alert ${assignMsg.includes('successfully') ? 'alert-success' : 'alert-error'}`}>{assignMsg}</div>}
            <div className="form-group">
              <label className="form-label">Select Verifier</label>
              <select className="form-input" value={selectedInspector} onChange={e => setSelectedInspector(e.target.value)}>
                <option value="">-- Choose inspector --</option>
                {inspectors.map(i => <option key={i.user_id} value={i.user_id}>{i.name} ({i.email})</option>)}
              </select>
              {inspectors.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>No inspectors found. Create staff accounts first.</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Scheduled Date <span style={{color: 'red'}}>*</span></label>
              <input type="date" className="form-input" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={assignInspector} disabled={!selectedInspector}>Assign</button>
              <button className="btn-outline" onClick={() => setAssignModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 400, maxWidth: '90%' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#dc2626' }}>Reject {properties.find(p => p.property_id === rejectModal)?.title || `Property #${rejectModal}`}</h3>
            <div className="form-group">
              <label className="form-label">Reason (optional)</label>
              <textarea className="form-input" rows={3} placeholder="e.g. Images do not match description" value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-danger" onClick={rejectProperty}>Confirm Reject</button>
              <button className="btn-outline" onClick={() => setRejectModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['all', 'All'],
          ['pending', 'Pending Approval'],
          ['approved', 'Approved'],
          ['inspecting', 'In Inspection'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1.5px solid', borderColor: tab === key ? 'var(--primary)' : 'var(--border)', background: tab === key ? 'var(--primary)' : 'white', color: tab === key ? 'white' : 'var(--text-muted)', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Address</th>
                  <th>Price/Night</th>
                  <th>Approval</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No properties</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.property_id}>
                    <td>#{p.property_id}</td>
                    <td style={{ fontWeight: 600, maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 150 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <MapPin size={10} />{p.address}
                      </div>
                    </td>
                    <td>Rs.{Number(p.price_per_night).toLocaleString()}</td>
                    <td><span className={`badge ${p.is_approved ? 'badge-success' : 'badge-warning'}`}>{p.is_approved ? 'Approved' : 'Pending'}</span></td>
                    <td><span className={`badge ${vBadge[p.verification_status] || 'badge-gray'}`}>{p.verification_status || 'none'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {!p.is_approved && (
                          <button className="btn-success btn-sm" onClick={() => approve(p.property_id)} title="Approve" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={11} /> Approve
                          </button>
                        )}
                        {!p.is_approved && (
                          <button className="btn-danger btn-sm" onClick={() => openRejectModal(p.property_id)} title="Reject" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <X size={11} /> Reject
                          </button>
                        )}
                        {p.is_approved && (
                          <button className="btn-danger btn-sm" onClick={() => openRejectModal(p.property_id)} title="Revoke" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <X size={11} /> Revoke
                          </button>
                        )}
                        <button
                          className="btn-outline btn-sm"
                          onClick={() => openAssignModal(p.property_id)}
                          title="Assign Inspector"
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UserPlus size={11} /> Inspector
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
