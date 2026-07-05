import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicNav from '../../components/PublicNav';
import Footer from '../../components/Footer';
import api from '../../api';
import { getImageUrl } from '../../utils';
import { MapPin, Star, Users, ArrowLeft, Calendar } from 'lucide-react';

export default function PropertyDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');

  useEffect(() => {
    api.get(`/properties/${id}`).then(r => setProperty(r.data)).catch(() => {});
    // Backend returns { total_reviews, average_rating, reviews: [...] }
    api.get(`/reviews/property/${id}`).then(r => setReviews(r.data?.reviews || r.data || [])).catch(() => {});
  }, [id]);

  if (!property) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ color: 'var(--text-muted)' }}>Loading...</div></div>;

  const nights = checkin && checkout ? Math.max(0, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000)) : 0;
  const total = nights * Number(property.price_per_night);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNav />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Properties
        </button>

        {/* Image */}
        <div style={{ borderRadius: 16, overflow: 'hidden', height: 360, background: '#e5e7eb', marginBottom: 32 }}>
          {property.image
            ? <img src={getImageUrl(property.image)} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e3a8a22,#1e3a8a55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🏠</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{property.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 14 }}>
                  <MapPin size={14} />{property.address}
                </div>
              </div>
              {property.verification_badge === 1 && <span className="badge badge-success" style={{ fontSize: 12 }}>✓ Verified</span>}
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 24, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={16} color="#f59e0b" fill="#f59e0b" /><span style={{ fontWeight: 600 }}>{property.overall_score || '—'}</span><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>rating</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={16} color="var(--primary)" /><span style={{ fontWeight: 600 }}>{property.max_guests}</span><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>max guests</span></div>
            </div>

            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>About this property</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32 }}>{property.description}</p>

            {/* Reviews */}
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Guest Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p> : reviews.map(r => (
              <div key={r.review_id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} color={i < r.rating ? '#f59e0b' : '#e5e7eb'} fill={i < r.rating ? '#f59e0b' : '#e5e7eb'} />)}
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>{r.review_date}</span>
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: 14 }}>{r.comment}</p>
                {r.host_response && <div style={{ marginTop: 10, padding: 10, background: '#f5f6fa', borderRadius: 8, fontSize: 13 }}><strong>Host reply:</strong> {r.host_response}</div>}
              </div>
            ))}
          </div>

          {/* Booking card */}
          <div>
            <div className="card" style={{ position: 'sticky', top: 80, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>Rs.{Number(property.price_per_night).toLocaleString()}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/night</span></div>
              <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 16, paddingBottom: 16 }} />
              <div className="form-group">
                <label className="form-label">Check-in</label>
                <input className="form-input" type="date" value={checkin} onChange={e => setCheckin(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Check-out</label>
                <input className="form-input" type="date" value={checkout} onChange={e => setCheckout(e.target.value)} />
              </div>
              {nights > 0 && (
                <div style={{ background: '#f5f6fa', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Rs.{Number(property.price_per_night).toLocaleString()} × {nights} nights</span><span>Rs.{total.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total</span><span>Rs.{total.toLocaleString()}</span></div>
                </div>
              )}
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', borderRadius: 8 }} onClick={() => nav('/login')}>
                <Calendar size={16} /> Reserve Now
              </button>
              <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
