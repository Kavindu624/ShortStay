import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Download, CreditCard, RefreshCw, FileText, X } from 'lucide-react';

export default function GuestWallet() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const viewReceipt = async (bookingId) => {
    setReceiptLoading(true);
    try {
      const r = await api.get(`/payments/receipt/${bookingId}`);
      // Backend returns { receipt: { ... } }
      setReceipt(r.data?.receipt || r.data);
    } catch { setReceipt({ error: 'Receipt not found' }); }
    finally { setReceiptLoading(false); }
  };

  useEffect(() => {
    api.get('/payments/my-payments')
      // Backend returns { total, payments: [...] }
      .then(r => setPayments(r.data?.payments || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const downloadStatement = () => {
    let csv = 'Transaction ID,Date,Amount,Status\n';
    payments.forEach(p => {
      csv += `${p.payment_id},${new Date(p.payment_date).toLocaleDateString()},"Rs. ${Number(p.amount).toLocaleString()}",${p.payment_status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wallet_statement.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      {/* Receipt Modal */}
      {receipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Payment Receipt</h3>
              <button onClick={() => setReceipt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {receipt.error ? (
              <p style={{ color: '#dc2626', fontSize: 13 }}>{receipt.error}</p>
            ) : (
              <div style={{ fontSize: 13 }}>
                <div style={{ background: '#eff6ff', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontWeight: 700, color: 'var(--primary)', fontSize: 12 }}>
                  Receipt #{receipt.receipt_number}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Booking #</span><strong>#{receipt.booking_id}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Property</span><strong>{receipt.property}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Guest</span><strong>{receipt.guest}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Check-in</span><strong>{receipt.checkin_date}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Check-out</span><strong>{receipt.checkout_date}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Amount</span><strong style={{ color: 'var(--accent)', fontSize: 15 }}>Rs.{Number(receipt.amount || 0).toLocaleString()}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Method</span><strong style={{ textTransform: 'capitalize' }}>{receipt.payment_method || 'Card'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Status</span><span className={`badge ${receipt.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{receipt.payment_status}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Date</span><strong>{receipt.payment_date?.substring(0, 10)}</strong></div>
              </div>
            )}
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => setReceipt(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><div className="page-title">Wallet</div><div className="page-subtitle">Manage your balance and transactions</div></div>
        <button onClick={downloadStatement} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} /> Download Statement</button>
      </div>

      {/* Balance banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #2d50a8)', borderRadius: 12, padding: '24px 28px', marginBottom: 20, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Total Spent</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>Rs.{totalSpent.toLocaleString()}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Across all your bookings</div>
        </div>
        <CreditCard size={40} style={{ opacity: 0.4 }} />
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Transactions', value: payments.length, color: 'var(--text-main)' },
          { label: 'Total Spent', value: `Rs.${totalSpent.toLocaleString()}`, color: 'var(--accent-red)' },
          { label: 'Completed Payments', value: payments.filter(p => p.status === 'completed').length, color: 'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Transaction History</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No transactions yet.</div>
        ) : payments.map(p => (
          <div key={p.payment_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={16} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Booking #{p.booking_id}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.payment_method || 'Card'} • {p.payment_date?.substring(0, 10)}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--accent-red)' }}>- Rs.{Number(p.amount).toLocaleString()}</div>
                <span className={`badge ${p.status === 'completed' ? 'badge-success' : p.status === 'refunded' ? 'badge-warning' : 'badge-gray'}`} style={{ fontSize: 10, marginTop: 4 }}>{p.status || 'completed'}</span>
              </div>
              <button className="btn-outline btn-sm" onClick={() => viewReceipt(p.booking_id)}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="View receipt">
                <FileText size={11} /> Receipt
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>About Refunds</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Refunds are processed to your original payment method within 5-7 business days. Contact support if you have issues with a refund.</p>
        <button className="btn-primary btn-sm" onClick={() => navigate('/guest/complaints')}>Contact Support</button>
      </div>
    </DashboardLayout>
  );
}
