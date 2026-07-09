import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Download } from 'lucide-react';
import { showAlert } from '../../utils/alert';

export default function PMPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/payouts')
      .then(r => setPayouts(r.data?.payouts || r.data || []))
      .catch(() => setPayouts([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const exportCSV = () => {
    const csvRows = ['Payout ID,Booking ID,Host,Amount,Status,Date'];
    payouts.forEach(p => {
      csvRows.push(`${p.payout_id},${p.booking_id},"${p.host?.name || p.User?.name || ''}",${p.payout_amount},${p.status},${p.processed_at?.substring(0, 10) || p.created_at?.substring(0, 10) || ''}`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payouts_report.csv';
    a.click();
  };

  const processPayouts = async (pendingIds) => {
    if (!pendingIds.length) {
      showAlert('No pending payouts for this host.');
      return;
    }
    setProcessing(true);
    try {
      // Process sequentially to prevent SQLite 'database is locked' errors on concurrent writes
      for (const id of pendingIds) {
        await api.post(`/payouts/process/${id}`);
      }
      showAlert('Payouts processed successfully!');
      load();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to process payouts');
    } finally {
      setProcessing(false);
    }
  };

  // Aggregate by host for the main table
  const hostMap = {};
  payouts.forEach(p => {
    const hid = p.host_id;
    if (!hostMap[hid]) {
      hostMap[hid] = {
        id: hid,
        name: p.host?.name || `Host #${hid}`,
        email: p.host?.email || `host${hid}@email.com`,
        initials: (p.host?.name || `H ${hid}`).split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
        totalEarnings: 0,
        pendingAmount: 0,
        pendingIds: [],
        properties: new Set(),
        bankStatus: hid % 2 === 0 ? 'pending' : 'verified',
        lastPayout: 'Dec 15, 2020',
      };
    }
    const h = hostMap[hid];
    h.totalEarnings += Number(p.payout_amount || 0);
    if (p.status === 'pending') {
      h.pendingAmount += Number(p.payout_amount || 0);
      h.pendingIds.push(p.payout_id);
    }
    if (p.Booking?.property?.title) h.properties.add(p.Booking.property.title);
  });
  
  let groupedHosts = Object.values(hostMap).map(h => ({ ...h, propertiesCount: h.properties.size || 1 }));

  const recentPayouts = payouts.slice(0, 5).map(p => ({
    name: p.host?.name || `Host #${p.host_id}`,
    booking: `BK-${p.booking_id}`,
    date: p.processed_at?.substring(0, 10) || p.created_at?.substring(0, 10) || '',
    amount: Number(p.payout_amount || 0),
    method: 'Bank Transfer'
  }));

  const totalPendingPayouts = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.payout_amount || 0), 0);
  const completedThisMonth = payouts.filter(p => p.status === 'completed' && new Date(p.processed_at).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + Number(p.payout_amount || 0), 0);
  const totalHosts = groupedHosts.length;

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">Host Payouts</div>
          <div className="page-subtitle">Manage and process host payments</div>
        </div>
        <button className="btn-primary" onClick={exportCSV} style={{ background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Total Pending Payouts</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{totalPendingPayouts.toLocaleString()} LKR</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Completed This Month</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{completedThisMonth.toLocaleString()} LKR</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Total Hosts</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{totalHosts}</span>
        </div>
      </div>

      {/* Host Payout Management */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Host Payout Management</h3>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Host</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Earnings</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Pending Amount</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Properties</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Bank Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Last Payout</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedHosts.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                        {h.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{h.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{h.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{h.totalEarnings} LKR</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f59e0b' }}>{h.pendingAmount} LKR</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{h.propertiesCount}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {h.bankStatus === 'verified' ? (
                      <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>verified</span>
                    ) : (
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>pending</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{h.lastPayout}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => processPayouts(h.pendingIds)} disabled={processing || h.pendingIds.length === 0} style={{ background: h.pendingIds.length > 0 ? '#1e3a8a' : '#9ca3af', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: h.pendingIds.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      {processing ? 'Processing...' : 'Release Payout'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payout History */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Recent Payout History</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentPayouts.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No recent payouts</div>}
          {recentPayouts.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < recentPayouts.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.booking} • {p.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#10b981', marginBottom: 4 }}>{p.amount.toLocaleString()} LKR</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.method}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}
