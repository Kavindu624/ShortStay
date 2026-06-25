import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Check, X, MapPin } from 'lucide-react';

const vBadge = { none: 'badge-gray', requested: 'badge-warning', inspecting: 'badge-info', approved: 'badge-success', rejected: 'badge-error' };

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const load = () => { api.get('/admin/properties').then(r => setProperties(r.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const approve = async (id) => { try { await api.put(`/admin/properties/${id}/approve`); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  const reject = async (id) => { try { await api.put(`/admin/properties/${id}/reject`); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };

  const filtered = tab === 'all' ? properties : tab === 'pending' ? properties.filter(p => !p.is_approved) : properties.filter(p => p.is_approved);

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Properties</div><div className="page-subtitle">Manage and approve property listings</div></div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'pending', 'approved'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1.5px solid', borderColor: tab === t ? 'var(--primary)' : 'var(--border)', background: tab === t ? 'var(--primary)' : 'white', color: tab === t ? 'white' : 'var(--text-muted)', cursor: 'pointer', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
        : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Title</th><th>Address</th><th>Price/Night</th><th>Approved</th><th>Verification</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.property_id}>
                      <td>#{p.property_id}</td>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{p.address}</div></td>
                      <td>Rs.{Number(p.price_per_night).toLocaleString()}</td>
                      <td><span className={`badge ${p.is_approved ? 'badge-success' : 'badge-warning'}`}>{p.is_approved ? 'Yes' : 'Pending'}</span></td>
                      <td><span className={`badge ${vBadge[p.verification_status] || 'badge-gray'}`}>{p.verification_status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {!p.is_approved && <button className="btn-success btn-sm" onClick={() => approve(p.property_id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Approve</button>}
                          {p.is_approved && <button className="btn-danger btn-sm" onClick={() => reject(p.property_id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><X size={12} /> Reject</button>}
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
