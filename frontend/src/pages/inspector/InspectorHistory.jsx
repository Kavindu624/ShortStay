import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { ClipboardCheck, Clock, CheckCircle, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';

const resultBadge = { passed: 'badge-success', failed: 'badge-error', pending: 'badge-warning' };

export default function InspectorHistory() {
  const [history, setHistory] = useState([]);
  const [successRate, setSuccessRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      api.get('/inspector/history'),
      api.get('/inspector/reports/success-rate'),
    ]).then(([hist, rate]) => {
      // Backend returns { total, inspections: [...] }
      if (hist.status === 'fulfilled') setHistory(hist.value.data?.inspections || hist.value.data || []);
      if (rate.status === 'fulfilled') setSuccessRate(rate.value.data);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const approveBadge = async (propertyId) => {
    if (!confirm('Approve verified badge for this property?')) return;
    try {
      await api.put(`/inspector/badge/${propertyId}`);
      alert('Badge approved!');
      load();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter === 'all' ? history
    : history.filter(i => i.result === filter);

  const passed = history.filter(i => i.result === 'passed').length;
  const failed = history.filter(i => i.result === 'failed').length;
  const rate = history.length > 0 ? Math.round((passed / history.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">Inspection History</div><div className="page-subtitle">Past inspection reports and outcomes</div></div>
        <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Inspections', value: history.length, icon: ClipboardCheck },
          { label: 'Passed', value: passed, icon: CheckCircle, color: '#10b981' },
          { label: 'Failed', value: failed, icon: XCircle, color: '#ef4444' },
          { label: 'Pass Rate', value: `${successRate?.pass_rate ?? rate}%`, icon: ShieldCheck, color: '#1e3a8a' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
            <div className="stat-icon" style={{ background: s.color || 'var(--primary)' }}><s.icon size={20} /></div>
          </div>
        ))}
      </div>

      {/* Pass rate bar */}
      {history.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Overall Pass Rate</span>
            <span style={{ fontWeight: 800, color: rate >= 70 ? 'var(--accent)' : '#ef4444' }}>{rate}%</span>
          </div>
          <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${rate}%`, background: rate >= 70 ? 'var(--accent)' : '#ef4444', borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all', 'All'], ['passed', 'Passed'], ['failed', 'Failed']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1.5px solid', borderColor: filter === key ? 'var(--primary)' : 'var(--border)', background: filter === key ? 'var(--primary)' : 'white', color: filter === key ? 'white' : 'var(--text-muted)', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <ClipboardCheck size={44} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No inspection records found.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Property</th><th>Result</th><th>Notes</th><th>Date</th><th>Badge</th></tr></thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.inspection_id}>
                    <td>#{i.inspection_id}</td>
                    <td style={{ fontWeight: 600 }}>
                      {i.Property?.title || `Property #${i.property_id}`}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{i.Property?.address}</div>
                    </td>
                    <td><span className={`badge ${resultBadge[i.result] || 'badge-gray'}`}>{i.result}</span></td>
                    <td style={{ maxWidth: 200, fontSize: 13, color: 'var(--text-muted)' }}>
                      {i.notes?.substring(0, 80)}{i.notes?.length > 80 ? '...' : ''}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {i.inspection_date?.substring(0, 10) || i.created_at?.substring(0, 10)}
                    </td>
                    <td>
                      {i.result === 'passed' && !i.Property?.is_verified && (
                        <button className="btn-success btn-sm" onClick={() => approveBadge(i.property_id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ShieldCheck size={11} /> Approve Badge
                        </button>
                      )}
                      {i.Property?.is_verified && (
                        <span className="badge badge-success" style={{ fontSize: 10 }}>✓ Verified</span>
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
