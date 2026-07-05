import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { DollarSign, Clock, CheckCircle, TrendingUp, ArrowDownCircle } from 'lucide-react';

const statusBadge = { pending: 'badge-warning', processed: 'badge-success', failed: 'badge-error' };

export default function HostPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    api.get('/payouts/my-payouts')
      // Backend returns { total, payouts: [...] }
      .then(r => setPayouts(r.data?.payouts || r.data || []))
      .catch(() => setPayouts([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.payout_amount || p.amount || 0), 0);
  const totalPending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.payout_amount || p.amount || 0), 0);
  const filtered = tab === 'all' ? payouts : payouts.filter(p => p.status === tab);

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Payouts</div><div className="page-subtitle">Track your earnings and payout history</div></div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Paid Out', value: `Rs.${totalPaid.toLocaleString()}`, icon: CheckCircle, color: '#10b981' },
          { label: 'Pending Payouts', value: `Rs.${totalPending.toLocaleString()}`, icon: Clock, color: '#f59e0b' },
          { label: 'Total Payouts', value: payouts.length, icon: ArrowDownCircle, color: '#1e3a8a' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
            <div className="stat-icon" style={{ background: s.color }}><s.icon size={20} /></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all', 'All'], ['pending', 'Pending'], ['processed', 'Processed']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1.5px solid', borderColor: tab === key ? 'var(--primary)' : 'var(--border)', background: tab === key ? 'var(--primary)' : 'white', color: tab === key ? 'white' : 'var(--text-muted)', cursor: 'pointer', textTransform: 'capitalize' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <DollarSign size={44} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No {tab !== 'all' ? tab : ''} payouts found.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Payout #</th><th>Booking</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.payout_id}>
                    <td style={{ fontWeight: 600 }}>#{p.payout_id}</td>
                    <td>#{p.booking_id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>Rs.{Number(p.amount).toLocaleString()}</td>
                    <td><span className={`badge ${statusBadge[p.status] || 'badge-gray'}`}>{p.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.processed_at ? p.processed_at.substring(0, 10) : p.created_at?.substring(0, 10) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
        <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>About Payouts</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Payouts are processed within 3-5 business days after a guest checks out. Contact support if a payout is overdue.
        </p>
      </div>
    </DashboardLayout>
  );
}
