import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Download, MessageSquare, XCircle, CreditCard, Star, FileText } from 'lucide-react';
import { exportToCSV } from '../../utils';

const statusBadge = { 
  confirmed: 'badge-success', 
  pending: 'badge-warning', 
  cancelled: 'badge-error', 
  completed: 'badge-info' 
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const nav = useNavigate();

  const load = () => { 
    api.get('/bookings/my')
      .then(r => setBookings(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false)); 
  };
  
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try { 
      await api.put(`/bookings/${id}/cancel`); 
      load(); 
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed'); 
    }
  };

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div className="page-title">My Bookings</div>
          <div className="page-subtitle">View and manage your reservations</div>
        </div>
        <button className="btn-outline" onClick={() => exportToCSV(bookings, 'my_bookings.csv')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontWeight: 600 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ 
              padding: '7px 16px', borderRadius: 20, fontWeight: 600, fontSize: 13, 
              border: '1.5px solid', borderColor: tab === t ? 'var(--primary)' : 'var(--border)', 
              background: tab === t ? 'var(--primary)' : 'transparent', 
              color: tab === t ? 'white' : 'var(--text-muted)', 
              cursor: 'pointer', textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <FileText size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>No bookings found.</p>
          <p style={{ fontSize: 13, marginBottom: 16 }}>You don't have any reservations matching this status.</p>
          <button className="btn-primary" onClick={() => nav('/guest/browse')}>Browse Properties</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
          {filtered.map(b => (
            <div key={b.booking_id} className="card" style={{ padding: 24 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{b.property?.title || `Property #${b.property_id}`}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>Hosted by {b.Property?.Host?.name || 'ShortStay Host'}</div>
                </div>
                <span className={`badge ${statusBadge[b.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize', fontSize: 11, padding: '4px 10px' }}>
                  {b.status}
                </span>
              </div>

              {/* Grid Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Booking ID</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>BK-{new Date(b.created_at || Date.now()).getFullYear()}-{String(b.booking_id).padStart(3, '0')}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Check-in</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{b.checkin_date}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Check-out</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{b.checkout_date}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Total Amount</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Rs.{Number(b.total_price).toLocaleString()}</div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 8, marginBottom: 24, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>Booking Timeline</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                  <div style={{ fontSize: 12, color: 'var(--text-main)' }}>Booking created <span style={{ color: 'var(--text-muted)' }}>• {b.created_at?.substring(0, 10) || 'Just now'}</span></div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: (b.status === 'confirmed' || b.status === 'completed') ? '#10b981' : '#cbd5e1' }}></div>
                  <div style={{ fontSize: 12, color: (b.status === 'confirmed' || b.status === 'completed') ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    Payment {b.payment_status === 'paid' ? 'confirmed' : (b.status === 'approved' ? 'pending (Pay Now)' : 'pending')} 
                    {(b.status === 'confirmed' || b.status === 'completed') && <span style={{ color: 'var(--text-muted)' }}> • {b.created_at?.substring(0, 10) || 'Just now'}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.status === 'completed' ? '#10b981' : '#cbd5e1' }}></div>
                  <div style={{ fontSize: 12, color: b.status === 'completed' ? 'var(--text-main)' : 'var(--text-muted)' }}>Check-in <span style={{ color: 'var(--text-muted)' }}>• {b.checkin_date}</span></div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ padding: '8px 20px' }} onClick={() => nav(`/guest/property/${b.property_id}`)}>
                  View Details
                </button>
                
                {(b.status === 'pending' || b.status === 'approved' || b.status === 'confirmed') && (
                  <button onClick={() => cancel(b.booking_id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginLeft: 'auto' }}>
                    <XCircle size={14} /> Cancel Booking
                  </button>
                )}

                {(b.status === 'approved' && b.payment_status !== 'paid') && (
                  <button onClick={() => nav(`/guest/pay/${b.booking_id}`)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#10b981', border: 'none', marginLeft: 'auto' }}>
                    <CreditCard size={14} /> Pay Now
                  </button>
                )}

                {b.status === 'completed' && (
                  <button onClick={() => nav(`/guest/reviews`)} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                    <Star size={14} /> Write Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Need Help Section */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Need Help?</h4>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          If you have any questions about your booking, our support team is here to help 24/7.
        </p>
        <div>
          <button className="btn-primary" onClick={() => nav('/contact')} style={{ padding: '8px 20px', borderRadius: 8 }}>
            Contact Support
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
