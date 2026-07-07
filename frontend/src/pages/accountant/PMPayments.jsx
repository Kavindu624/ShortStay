import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { RefreshCw, AlertTriangle, CheckCircle, DollarSign, Undo2 } from 'lucide-react';

const statusBadge = { completed: 'badge-success', pending: 'badge-warning', failed: 'badge-error', refunded: 'badge-info' };
const disputeBadge = { open: 'badge-warning', resolved: 'badge-success', rejected: 'badge-error' };

export default function PMPayments() {
  const [tab, setTab] = useState('all');
  const [payments, setPayments] = useState([]);
  const [pending, setPending] = useState([]);
  const [failed, setFailed] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refund modal state
  const [refundModal, setRefundModal] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundType, setRefundType] = useState('full'); // full | partial
  const [actionMsg, setActionMsg] = useState('');

  // Dispute resolution state
  const [disputeModal, setDisputeModal] = useState(null);
  const [disputeResolution, setDisputeResolution] = useState('');

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      api.get('/payments'),
      api.get('/payments/pending'),
      api.get('/payments/failed'),
      api.get('/payments/disputes'),
    ]).then(([all, pend, fail, disp]) => {
      // All return { payments: [...] } or { disputes: [...] } not plain arrays
      if (all.status === 'fulfilled') setPayments(all.value.data?.payments || all.value.data || []);
      if (pend.status === 'fulfilled') setPending(pend.value.data?.payments || pend.value.data || []);
      if (fail.status === 'fulfilled') setFailed(fail.value.data?.payments || fail.value.data || []);
      if (disp.status === 'fulfilled') setDisputes(disp.value.data?.disputes || disp.value.data || []);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openRefund = (payment, type) => {
    setRefundModal(payment);
    setRefundType(type);
    setRefundAmount('');
    setRefundReason('');
    setActionMsg('');
  };

  const issueRefund = async () => {
    if (!refundModal) return;
    setActionMsg('');
    try {
      if (refundType === 'partial') {
        await api.post(`/payments/refund/${refundModal.booking_id}/partial`, {
          amount: Number(refundAmount),
          reason: refundReason,
        });
      } else {
        await api.post(`/payments/refund/${refundModal.booking_id}`, { reason: refundReason });
      }
      setActionMsg('Refund issued successfully!');
      setTimeout(() => { setRefundModal(null); load(); }, 1200);
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Refund failed');
    }
  };

  const updatePaymentStatus = async (paymentId, status) => {
    try {
      await api.put(`/payments/status/${paymentId}`, { status });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const openDisputeModal = (d) => { setDisputeModal(d); setDisputeResolution(''); setActionMsg(''); };

  const resolveDispute = async () => {
    if (!disputeModal) return;
    try {
      await api.put(`/payments/disputes/${disputeModal.dispute_id}/resolve`, { resolution: disputeResolution });
      setActionMsg('Dispute resolved!');
      setTimeout(() => { setDisputeModal(null); load(); }, 1200);
    } catch (err) { setActionMsg(err.response?.data?.message || 'Failed'); }
  };

  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">Payment Management</div><div className="page-subtitle">Manage all payments, refunds, and disputes</div></div>
        <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Revenue', value: `Rs.${totalRevenue.toLocaleString()}`, icon: DollarSign },
          { label: 'Pending Payments', value: pending.length, icon: AlertTriangle },
          { label: 'Failed Payments', value: failed.length, icon: AlertTriangle },
          { label: 'Open Disputes', value: disputes.filter(d => d.status !== 'resolved').length, icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div></div>
            <div className="stat-icon"><s.icon size={20} /></div>
          </div>
        ))}
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{refundType === 'full' ? 'Full Refund' : 'Partial Refund'} — Booking #{refundModal.booking_id}</h3>
            {actionMsg && <div className={`alert ${actionMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>{actionMsg}</div>}
            {refundType === 'partial' && (
              <div className="form-group">
                <label className="form-label">Refund Amount (Rs.)</label>
                <input className="form-input" type="number" placeholder="Enter amount" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea className="form-input" rows={2} placeholder="Reason for refund..." value={refundReason} onChange={e => setRefundReason(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-danger" onClick={issueRefund}>Confirm Refund</button>
              <button className="btn-outline" onClick={() => setRefundModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Resolve Dispute #{disputeModal.dispute_id}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}><strong>Reason:</strong> {disputeModal.reason}</p>
            {actionMsg && <div className={`alert ${actionMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>{actionMsg}</div>}
            <div className="form-group">
              <label className="form-label">Resolution Note</label>
              <textarea className="form-input" rows={3} placeholder="How was this resolved?" value={disputeResolution} onChange={e => setDisputeResolution(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-success" onClick={resolveDispute}>Mark Resolved</button>
              <button className="btn-outline" onClick={() => setDisputeModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['all', `All Payments (${payments.length})`],
          ['pending', `Pending (${pending.length})`],
          ['failed', `Failed (${failed.length})`],
          ['disputes', `Disputes (${disputes.length})`],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 12, border: '1.5px solid', borderColor: tab === key ? 'var(--primary)' : 'var(--border)', background: tab === key ? 'var(--primary)' : 'white', color: tab === key ? 'white' : 'var(--text-muted)', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : tab === 'disputes' ? (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Booking</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {disputes.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No disputes</td></tr>
                ) : disputes.map(d => (
                  <tr key={d.dispute_id}>
                    <td>#{d.dispute_id}</td>
                    <td>#{d.booking_id}</td>
                    <td style={{ maxWidth: 200, fontSize: 13 }}>{d.reason}</td>
                    <td><span className={`badge ${disputeBadge[d.status] || 'badge-gray'}`}>{d.status}</span></td>
                    <td>
                      {d.status !== 'resolved' && (
                        <button className="btn-success btn-sm" onClick={() => openDisputeModal(d)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={11} /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Booking</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {(tab === 'all' ? payments : tab === 'pending' ? pending : failed).length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments</td></tr>
                ) : (tab === 'all' ? payments : tab === 'pending' ? pending : failed).map(p => (
                  <tr key={p.payment_id}>
                    <td>#{p.payment_id}</td>
                    <td>#{p.booking_id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>Rs.{Number(p.amount).toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>{p.payment_method || 'card'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.payment_date?.substring(0, 10)}</td>
                    <td><span className={`badge ${statusBadge[p.status] || 'badge-gray'}`}>{p.status || 'completed'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn-outline btn-sm" onClick={() => openRefund(p, 'full')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Undo2 size={11} /> Refund
                        </button>
                        <button className="btn-warning btn-sm" onClick={() => openRefund(p, 'partial')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          Partial
                        </button>
                        {p.status === 'failed' && (
                          <button className="btn-success btn-sm" onClick={() => updatePaymentStatus(p.payment_id, 'completed')}>
                            Mark Paid
                          </button>
                        )}
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
