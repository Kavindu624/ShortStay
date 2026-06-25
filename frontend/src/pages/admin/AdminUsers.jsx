import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Users, Trash2, Plus } from 'lucide-react';

const roleColors = { guest: 'badge-info', host: 'badge-success', admin: 'badge-error', field_inspector: 'badge-warning', payment_manager: 'badge-gray' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'field_inspector' });
  const [msg, setMsg] = useState('');

  const load = () => { api.get('/admin/users').then(r => setUsers(r.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/admin/users/${id}`); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
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
                <option value="field_inspector">Field Inspector</option>
                <option value="payment_manager">Payment Manager</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" type="submit">Create</button>
              <button className="btn-outline" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
        : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Membership</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.user_id}>
                      <td>#{u.user_id}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td><span className={`badge ${roleColors[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                      <td>{u.membership_level ? <span className="badge badge-warning">{u.membership_level}</span> : '—'}</td>
                      <td><button className="btn-danger btn-sm" onClick={() => deleteUser(u.user_id)}><Trash2 size={12} /></button></td>
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
