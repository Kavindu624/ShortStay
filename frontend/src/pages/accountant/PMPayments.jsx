import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Download } from 'lucide-react';
import { showAlert } from '../../utils/alert';

export default function PMPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/payments')
      .then(r => {
        let data = r.data?.payments || r.data || [];
        setPayments(data);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleRefund = (bookingId) => {
    setModalConfig({
      title: 'Process Refund',
      message: 'Enter reason for refund (e.g. host cancelled):',
      showInput: true,
      onConfirm: async (reason) => {
        if (!reason) {
          showAlert('Refund reason is required');
          return;
        }
        setModalConfig(null);
        try {
          await api.post(`/payments/refund/${bookingId}`, { reason });
          showAlert('Refund processed successfully!');
          load();
        } catch (err) {
          console.error(err);
          showAlert(err.response?.data?.message || 'Failed to process refund');
        }
      }
    });
  };

  const handleStatusUpdate = (paymentId, status) => {
    setModalConfig({
      title: 'Confirm Action',
      message: `Are you sure you want to mark this transaction as ${status}?`,
      showInput: false,
      onConfirm: async () => {
        setModalConfig(null);
        try {
          await api.put(`/payments/status/${paymentId}`, { status });
          showAlert(`Payment status updated to ${status}`);
          load();
        } catch (err) {
          console.error(err);
          showAlert(err.response?.data?.message || 'Failed to update status');
        }
      }
    });
  };

  let displayPayments = payments.map(p => {
    const booking = p.booking || p.Booking || {};
    const dateObj = new Date(p.payment_date || p.created_at);
    const year = !isNaN(dateObj.getTime()) ? dateObj.getFullYear() : '2026';
    const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : p.payment_date;
    
    return {
      rawPaymentId: p.payment_id,
      rawBookingId: p.booking_id,
      id: `PAY-${year}-${p.payment_id.toString().padStart(3, '0')}`,
      bookingId: `BK-${year}-${p.booking_id.toString().padStart(3, '0')}`,
      guest: booking.guest?.name || 'Unknown',
      host: booking.property?.host?.name || 'Unknown',
      amount: Number(p.amount || 0),
      commission: p.Payout?.commission_amount ? Number(p.Payout.commission_amount) : Number(p.amount || 0) * 0.1,
      payout: p.Payout?.payout_amount ? Number(p.Payout.payout_amount) : Number(p.amount || 0) * 0.9,
      method: p.payment_method || 'Credit Card',
      status: p.payment_status || p.status || 'completed',
      date: dateStr || '2026-01-01'
    };
  });

  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const platformCommission = totalPayments * 0.1;
  const pendingCount = displayPayments.filter(p => p.status === 'pending').length;
  const completedCount = displayPayments.filter(p => p.status === 'completed').length;
  const successRate = displayPayments.length > 0 ? ((completedCount / displayPayments.length) * 100).toFixed(1) : 100;
  const hostPayouts = totalPayments - platformCommission;

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">Track all platform transactions</div>
        </div>
        <button className="btn-primary no-print" onClick={() => window.print()} style={{ background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Total Payments</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{totalPayments.toLocaleString()} LKR</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Platform Commission</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{platformCommission.toLocaleString()} LKR</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Pending</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{pendingCount}</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Success Rate</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#1e3a8a' }}>{successRate}%</span>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Transaction History</h3>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Payment ID</th>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Booking</th>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Guest</th>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Host</th>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Amount</th>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Commission (10%)</th>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Host Payout</th>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Method</th>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Status</th>
                <th style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>Date</th>
                <th className="no-print" style={{ padding: '12px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayPayments.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.id}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.bookingId}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.guest}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.host}</td>
                  <td style={{ padding: '12px', fontWeight: 500 }}>{p.amount} LKR</td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#10b981' }}>{p.commission} LKR</td>
                  <td style={{ padding: '12px', fontWeight: 500 }}>{p.payout} LKR</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {p.method === 'Bank Transfer' ? (
                      <>Bank<br/>Transfer</>
                    ) : (
                      <>Credit<br/>Card</>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {p.status === 'completed' ? (
                      <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>completed</span>
                    ) : p.status === 'refunded' ? (
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>refunded</span>
                    ) : p.status === 'failed' ? (
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>failed</span>
                    ) : (
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>pending</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{p.date}</td>
                  <td className="no-print" style={{ padding: '12px', textAlign: 'right' }}>
                    {p.status === 'completed' && (
                      <button onClick={() => handleRefund(p.rawBookingId)} style={{ background: 'white', color: '#dc2626', border: '1px solid #dc2626', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Refund</button>
                    )}
                    {p.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => handleStatusUpdate(p.rawPaymentId, 'completed')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Approve</button>
                        <button onClick={() => handleStatusUpdate(p.rawPaymentId, 'failed')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Decline</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Commission Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Total Guest Payments</span>
            <span style={{ fontWeight: 600, color: '#111827' }}>{totalPayments.toLocaleString()} LKR</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Platform Commission (10%)</span>
            <span style={{ fontWeight: 600, color: '#10b981' }}>-{platformCommission.toLocaleString()} LKR</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
            <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>Total Host Payouts</span>
            <span style={{ fontWeight: 600, color: '#111827' }}>{hostPayouts.toLocaleString()} LKR</span>
          </div>
        </div>
      </div>

      {modalConfig && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: 400, maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>{modalConfig.title}</h3>
            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>{modalConfig.message}</p>
            {modalConfig.showInput && (
              <input 
                autoFocus
                type="text" 
                id="modal-input"
                style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} 
                placeholder="Reason..." 
              />
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-outline" onClick={() => setModalConfig(null)} style={{ padding: '8px 16px', borderRadius: 6, fontWeight: 600 }}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                const val = modalConfig.showInput ? document.getElementById('modal-input')?.value : null;
                modalConfig.onConfirm(val);
              }} style={{ padding: '8px 16px', borderRadius: 6, fontWeight: 600 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
