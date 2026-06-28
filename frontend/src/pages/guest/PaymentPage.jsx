import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { ArrowLeft, CreditCard } from 'lucide-react';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const nav = useNavigate();
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({ card_number: '', expiry: '', cvv: '', first_name: '', last_name: '', address: '', city: '', province: '', postal_code: '', mobile: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get(`/bookings/${bookingId}`).then(r => setBooking(r.data)).catch(() => {}); }, [bookingId]);

  const handlePay = async () => {
    setLoading(true); setMsg('');
    try {
      await api.post('/payments/process', {
        booking_id: Number(bookingId),
        payment_method: 'card',
      });
      setMsg('Payment successful! Redirecting...');
      setTimeout(() => nav('/guest/bookings'), 2000);
    } catch (err) { setMsg(err.response?.data?.message || 'Payment failed.'); }
    finally { setLoading(false); }
  };

  const nights = booking ? Math.ceil((new Date(booking.checkout_date) - new Date(booking.checkin_date)) / 86400000) : 0;
  const base = booking ? Number(booking.total_price) : 0;
  const service = Math.round(base * 0.05);
  const tax = Math.round(base * 0.10);
  const total = base + service + tax;

  return (
    <DashboardLayout>
      <button onClick={() => nav(-1)} style={{ background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontWeight: 500, cursor: 'pointer' }}>
        <ArrowLeft size={16} /> Back to Property
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Billing form */}
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: 18 }}>Billing Payment</h2>
          {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Payment Type</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
              <CreditCard size={15} /> Credit Card
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Credit Card Number</label>
            <input className="form-input" placeholder="1234 5678 9012 3456" value={form.card_number} onChange={e => setForm({ ...form, card_number: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Expiry Date (MM/YEAR)</label>
              <input className="form-input" placeholder="12/2026" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">CVV</label>
              <input className="form-input" placeholder="123" value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" placeholder="John" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="Doe" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Billing Address</label>
            <input className="form-input" placeholder="123 Main Street" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" placeholder="Colombo" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Province</label>
              <input className="form-input" placeholder="Western" value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input className="form-input" placeholder="00100" value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input className="form-input" placeholder="+94 77 123 4567" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="john.doe@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Cost breakdown */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Cost Breakdown</h3>
            <div className="form-group">
              <label className="form-label">Number of Days</label>
              <input className="form-input" value={nights} readOnly style={{ background: '#f9fafb' }} />
            </div>
            <div style={{ fontSize: 13 }}>
              {[
                [`Total cost of rent (${nights} days)`, `Rs. ${base.toLocaleString()}`],
                ['Service charges (5%)', `Rs. ${service.toLocaleString()}`],
                ['Tax (10%)', `Rs. ${tax.toLocaleString()}`],
                ['Discount', '- Rs. 0'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: l === 'Discount' ? 'var(--accent)' : 'var(--text-muted)' }}>
                  <span>{l}</span><span style={{ color: l === 'Discount' ? 'var(--accent)' : 'var(--text-main)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
              <span>Total Charge</span><span>Rs. {total.toLocaleString()}</span>
            </div>
            <button className="btn-primary" onClick={handlePay} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 13, borderRadius: 8, marginTop: 16 }}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            <button className="btn-gray" style={{ width: '100%', justifyContent: 'center', padding: 11, borderRadius: 8, marginTop: 8, fontSize: 13 }}>
              Simulate Failed Payment
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
