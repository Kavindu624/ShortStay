import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { MapPin, Star, Search, Filter } from 'lucide-react';

export default function BrowseListings() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/properties').then(r => setProperties(r.data.properties || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter(p =>
    p.is_approved && (
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.address?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-title">Browse Listings</div>
          <div className="page-subtitle">Find your perfect stay</div>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 24, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input className="form-input" placeholder="Search by title or location..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, margin: 0 }} />
          </div>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading properties...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
          <p>No properties found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map(p => (
            <div key={p.property_id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
              onClick={() => nav(`/guest/property/${p.property_id}`)}>
              <div style={{ height: 170, background: '#e5e7eb', position: 'relative' }}>
                {p.image
                  ? <img src={`http://localhost:5000/uploads/${p.image}`} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e3a8a22,#1e3a8a44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>🏠</div>}
                {p.verification_badge === 1 && (
                  <span className="badge badge-success" style={{ position: 'absolute', top: 10, right: 10 }}>✓ Verified</span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>{p.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>
                  <MapPin size={11} />{p.address}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{p.overall_score || '—'}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>
                    Rs.{Number(p.price_per_night).toLocaleString()}<span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 11 }}>/night</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
