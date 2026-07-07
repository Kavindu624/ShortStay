import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { DollarSign, Clock, CheckCircle, TrendingUp, Play, RefreshCw, Filter } from 'lucide-react';

const statusBadge = { pending: 'badge-warning', processed: 'badge-success', failed: 'badge-error' };

export default function PMPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [processing, setProcessing] = useState({});
  const [bookingId, setBookingId] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/payouts')
      // Backend returns { total, payouts: [...] }
      .then(r => setPayouts(r.data?.payouts || r.data || []))
      .catch(() => setPayouts([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const generatePayout = async () => {
    if (!bookingId) return;
    try {
      await api.post(`/payouts/generate/${bookingId}`);
      setMsg(`Payout generated for booking #${bookingId}!`);
      setBookingId('');
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to generate payout'); }
  };

  const processPayout = async (payoutId) => {
    setProcessing(prev => ({ ...prev, [payoutId]: true }));
    try {
      await api.post(`/payouts/process/${payoutId}`);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Failed to process payout'); }
    finally { setProcessing(prev => ({ ...prev, [payoutId]: false })); }
  };

  const filtered = tab === 'all' ? payouts : payouts.filter(p => p.status === tab);
  const totalPending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalProcessed = payouts.filter(p => p.status === 'processed').reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Payouts Management</div><div className="page-subtitle">Generate and process host payouts</div></div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Pending Payouts', value: payouts.filter(p => p.status === 'pending').length, sub: `Rs.${totalPending.toLocaleString()} due`, icon: Clock, color: '#f59e0b' },
          { label: 'Processed', value: payouts.filter(p => p.status === 'processed').length, sub: `Rs.${totalProcessed.toLocaleString()} paid`, icon: CheckCircle, color: '#10b981' },
          { label: 'Total Payouts', value: payouts.length, icon: TrendingUp, color: '#1e3a8a' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div>{s.sub && <div className="stat-sub">{s.sub}</div>}</div>
            <div className="stat-icon" style={{ background: s.color }}><s.icon size={20} /></div>
          </div>
        ))}
      </div>

      {msg && <div className={`alert ${msg.includes('generated') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msg}</div>}

      {/* Generate payout */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Generate Payout</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label className="form-label">Booking ID</label>
            <input className="form-input" type="number" placeholder="Enter booking ID..." value={bookingId} onChange={e => setBookingId(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={generatePayout} disabled={!bookingId} style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
            <DollarSign size={14} /> Generate Payout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all', 'All'], ['pending', 'Pending'], ['processed', 'Processed'], ['failed', 'Failed']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1.5px solid', borderColor: tab === key ? 'var(--primary)' : 'var(--border)', background: tab === key ? 'var(--primary)' : 'white', color: tab === key ? 'white' : 'var(--text-muted)', cursor: 'pointer', textTransform: 'capitalize' }}>
            {label}
          </button>
        ))}
        <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: '1.5px solid var(--border)', borderRadius: 20, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No payouts found.</div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Payout #</th><th>Booking</th><th>Host</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.payout_id}>
                    <td style={{ fontWeight: 600 }}>#{p.payout_id}</td>
                    <td>#{p.booking_id}</td>
                    <td>{p.host_name || p.User?.name || `Host #${p.host_id}`}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>Rs.{Number(p.amount).toLocaleString()}</td>
                    <td><span className={`badge ${statusBadge[p.status] || 'badge-gray'}`}>{p.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.processed_at?.substring(0, 10) || p.created_at?.substring(0, 10) || '—'}</td>
                    <td>
                      {p.status === 'pending' && (
                        <button className="btn-success btn-sm" onClick={() => processPayout(p.payout_id)} disabled={processing[p.payout_id]} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Play size={11} /> {processing[p.payout_id] ? 'Processing...' : 'Process'}
                        </button>
                      )}
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
