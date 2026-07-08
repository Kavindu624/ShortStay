import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { showAlert } from '../../utils/alert';
import { Link } from 'react-router-dom';
import { Users, Trash2, Plus, ShieldOff, ShieldCheck, AlertTriangle, LineChart } from 'lucide-react';

const roleColors = { guest: 'badge-info', host: 'badge-success', admin: 'badge-error', verifier: 'badge-warning', accountant: 'badge-primary' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'verifier' });
  const [msg, setMsg] = useState('');
  const [suspendReason, setSuspendReason] = useState({});
  const [showSuspendFor, setShowSuspendFor] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [forceDeleteModal, setForceDeleteModal] = useState(null);

  const load = () => { api.get('/admin/users').then(r => setUsers(r.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const confirmDelete = async (force = false) => {
    const targetUser = force ? forceDeleteModal.user : deleteModal;
    if (!targetUser) return;
    try { 
      await api.delete(`/admin/users/${targetUser.user_id}${force ? '?force=true' : ''}`); 
      load(); 
      setDeleteModal(null);
      setForceDeleteModal(null);
    } catch (err) { 
      const errorMsg = err.response?.data?.message || 'Failed';
      if (!force && errorMsg.includes('active bookings')) {
        setDeleteModal(null);
        setForceDeleteModal({ user: targetUser, msg: errorMsg });
      } else {
        showAlert(errorMsg);
      }
    }
  };

  const suspendUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/suspend`, { reason: suspendReason[id] || 'Policy violation' });
      setShowSuspendFor(null);
      load();
    } catch (err) { showAlert(err.response?.data?.message || 'Failed'); }
  };

  const unsuspendUser = async (id) => {
    try { await api.put(`/admin/users/${id}/unsuspend`); load(); } catch (err) { showAlert(err.response?.data?.message || 'Failed'); }
  };

  const createStaff = async e => {
    e.preventDefault(); setMsg('');
    try { await api.post('/auth/create-staff', form); setMsg('Staff created!'); setShowCreate(false); load(); } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">Users</div><div className="page-subtitle">Manage all platform users</div></div>
        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}><Plus size={14} /> Create Staff</button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20, maxWidth: 480 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Create Staff Account</h3>
          {msg && <div className={`alert ${msg.includes('created') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={createStaff}>
            <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="verifier">Verifier</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" type="submit">Create</button>
              <button className="btn-outline" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Suspend reason inline form */}
      {showSuspendFor && (
        <div className="card" style={{ marginBottom: 16, border: '1.5px solid #fee2e2', maxWidth: 480 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 10, color: '#dc2626' }}>Suspend User #{showSuspendFor}</h4>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <input className="form-input" placeholder="e.g. Repeated policy violations" value={suspendReason[showSuspendFor] || ''}
              onChange={e => setSuspendReason(prev => ({ ...prev, [showSuspendFor]: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-danger btn-sm" onClick={() => suspendUser(showSuspendFor)}>Confirm Suspend</button>
            <button className="btn-outline btn-sm" onClick={() => setShowSuspendFor(null)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
        : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Membership</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.user_id}>
                      <td>#{u.user_id}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td><span className={`badge ${roleColors[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                      <td>{u.membership_level ? <span className="badge badge-warning">{u.membership_level}</span> : '—'}</td>
                      <td><span className={`badge ${u.is_suspended ? 'badge-error' : 'badge-success'}`}>{u.is_suspended ? 'Suspended' : 'Active'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {u.is_suspended ? (
                            <button className="btn-success btn-sm" onClick={() => unsuspendUser(u.user_id)} title="Unsuspend" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }}>
                              <ShieldCheck size={14} />
                            </button>
                          ) : (
                            <button className="btn-warning btn-sm" onClick={() => setShowSuspendFor(u.user_id)} title="Suspend" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }}>
                              <ShieldOff size={14} />
                            </button>
                          )}
                          {u.role === 'host' && (
                            <Link to={`/admin/users/host/${u.user_id}`} className="btn-outline btn-sm" title="View Dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px', textDecoration: 'none' }}>
                              <LineChart size={14} />
                            </Link>
                          )}
                          <button className="btn-danger btn-sm" onClick={() => setDeleteModal(u)} title="Delete" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px' }}>
                            <Trash2 size={14} />
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

      {/* Delete User Modal */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111827' }}>Delete User?</h2>
            <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deleteModal.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={() => confirmDelete(false)} style={{ flex: 1, background: '#ef4444', justifyContent: 'center' }}>
                Yes, Delete
              </button>
              <button className="btn-outline" onClick={() => setDeleteModal(null)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Delete User Modal */}
      {forceDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 440, maxWidth: '90%', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color="#d97706" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111827' }}>Active Bookings Found</h2>
            <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
              {forceDeleteModal.msg}
            </p>
            <p style={{ color: '#b45309', fontSize: 13, marginBottom: 24, fontWeight: 600, background: '#fef3c7', padding: 12, borderRadius: 8 }}>
              Do you want to forcibly cancel all active bookings and delete this user anyway?
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={() => confirmDelete(true)} style={{ flex: 1, background: '#ef4444', justifyContent: 'center' }}>
                Force Delete
              </button>
              <button className="btn-outline" onClick={() => setForceDeleteModal(null)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
