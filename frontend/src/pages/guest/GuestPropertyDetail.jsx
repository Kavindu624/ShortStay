import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { getImageUrl } from '../../utils';
import { MapPin, Star, Users, ArrowLeft, Calendar, BadgeCheck } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function GuestPropertyDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [booking, setBooking] = useState(false);
  const [msg, setMsg] = useState('');
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    api.get(`/properties/${id}`).then(r => {
      setProperty(r.data);
      const imgs = r.data.images && r.data.images.length > 0 ? r.data.images : (r.data.image ? [{ image_url: r.data.image }] : []);
      setActiveImage(imgs.find(i => i.is_primary) || imgs[0] || null);
    }).catch(() => {});
    // Backend returns { total_reviews, average_rating, reviews: [...] }
    api.get(`/reviews/property/${id}`).then(r => setReviews(r.data?.reviews || r.data || [])).catch(() => {});
  }, [id]);

  if (!property) return <DashboardLayout><div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>Loading...</div></DashboardLayout>;

  const availableDatesStr = property?.availability?.map(d => d.available_date.split('T')[0]) || [];
  const isAvailable = (date) => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    const str = new Date(date - tzoffset).toISOString().split('T')[0];
    return availableDatesStr.includes(str);
  };

  const nights = checkin && checkout ? Math.max(0, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000)) : 0;
  const total = nights * Number(property.price_per_night);

  const handleBook = async () => {
    if (!checkin || !checkout || nights <= 0) { setMsg('Please select valid dates.'); return; }
    setBooking(true); setMsg('');
    try {
      const res = await api.post('/bookings', { property_id: id, checkin_date: checkin, checkout_date: checkout });
      setMsg('Booking submitted! Awaiting host approval.');
      nav('/guest/bookings');
    } catch (err) { setMsg(err.response?.data?.message || 'Booking failed.'); }
    finally { setBooking(false); }
  };

  return (
    <DashboardLayout>
      <button onClick={() => nav(-1)} style={{ background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontWeight: 500, cursor: 'pointer' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <div style={{ borderRadius: 12, overflow: 'hidden', height: 320, background: '#e5e7eb', marginBottom: 12 }}>
            {activeImage
              ? <img src={getImageUrl(activeImage.image_url || activeImage.image)} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e3a8a22,#1e3a8a44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🏠</div>}
          </div>
          
          {property.images && property.images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginBottom: 24 }}>
              {property.images.map(img => (
                <div key={img.image_id} 
                  onClick={() => setActiveImage(img)}
                  style={{ 
                    borderRadius: 8, overflow: 'hidden', height: 70, cursor: 'pointer',
                    border: activeImage?.image_id === img.image_id ? '2px solid var(--primary)' : '2px solid transparent',
                    opacity: activeImage?.image_id === img.image_id ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}>
                  <img src={getImageUrl(img.image_url)} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{property.title}</h1>
            {property.verification_badge && (
              <BadgeCheck size={26} color="#3b82f6" fill="#eff6ff" title="Verified Property" style={{ flexShrink: 0 }} />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            <MapPin size={13} />{property.address}
          </div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20, padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={14} color="#f59e0b" fill="#f59e0b" /><span style={{ fontWeight: 600 }}>{property.overall_score || '—'}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} color="var(--primary)" /><span style={{ fontWeight: 600 }}>{property.max_guests}</span><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>max guests</span></div>
            {property.verification_badge && <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BadgeCheck size={12} /> Verified</span>}
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>{property.description}</p>

          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No reviews yet.</p>
            : reviews.map(r => (
              <div key={r.review_id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} color={i < r.rating ? '#f59e0b' : '#e5e7eb'} fill={i < r.rating ? '#f59e0b' : '#e5e7eb'} />)}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{r.review_date}</span>
                </div>
                <p style={{ fontSize: 13 }}>{r.comment}</p>
                {r.host_response && <div style={{ marginTop: 8, padding: 8, background: '#f5f6fa', borderRadius: 6, fontSize: 12 }}><strong>Host:</strong> {r.host_response}</div>}
              </div>
            ))}
        </div>

        <div>
          <div className="card" style={{ position: 'sticky', top: 80, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginBottom: 16 }}>Rs.{Number(property.price_per_night).toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/night</span></div>
            {msg && <div className={`alert ${msg.includes('success') || msg.includes('submitted') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
            
            {property.availability?.length === 0 ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                This property is fully booked.
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Check-in</label>
                  <DatePicker
                    selected={checkin ? new Date(checkin) : null}
                    onChange={(date) => {
                      if (date) {
                        const tzoffset = date.getTimezoneOffset() * 60000;
                        setCheckin(new Date(date - tzoffset).toISOString().split('T')[0]);
                      } else setCheckin('');
                    }}
                    filterDate={isAvailable}
                    minDate={new Date()}
                    className="form-input"
                    placeholderText="Select date"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out</label>
                  <DatePicker
                    selected={checkout ? new Date(checkout) : null}
                    onChange={(date) => {
                      if (date) {
                        const tzoffset = date.getTimezoneOffset() * 60000;
                        setCheckout(new Date(date - tzoffset).toISOString().split('T')[0]);
                      } else setCheckout('');
                    }}
                    filterDate={isAvailable}
                    minDate={checkin ? new Date(checkin) : new Date()}
                    className="form-input"
                    placeholderText="Select date"
                  />
                </div>
                {nights > 0 && (
                  <div style={{ background: '#f5f6fa', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Rs.{Number(property.price_per_night).toLocaleString()} × {nights} nights</span><span>Rs.{total.toLocaleString()}</span></div>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total</span><span>Rs.{total.toLocaleString()}</span></div>
                  </div>
                )}
              </>
            )}
            
            <button className="btn-primary" disabled={booking || property.availability?.length === 0} onClick={handleBook} style={{ width: '100%', justifyContent: 'center', padding: 13, borderRadius: 8, opacity: property.availability?.length === 0 ? 0.5 : 1 }}>
              <Calendar size={15} />{booking ? 'Booking...' : property.availability?.length === 0 ? 'Unavailable' : 'Reserve Now'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>You won't be charged yet</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
