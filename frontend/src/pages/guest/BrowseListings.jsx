import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PublicLayout from '../../components/PublicLayout';
import api from '../../api';
import { getImageUrl } from '../../utils';
import { MapPin, Star, Search, Filter, X, Users, ChevronDown, BadgeCheck } from 'lucide-react';

const PROPERTY_TYPES = ['', 'apartment', 'house', 'villa', 'room', 'bungalow', 'cabin'];

export default function BrowseListings({ publicMode = false }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ 
    location: '', 
    min_price: '', 
    max_price: '', 
    property_type: '', 
    guests: '', 
    checkin_date: '',
    checkout_date: '',
    verification_status: '',
    availability_status: '',
    min_rating: '',
    sort: 'newest' 
  });
  const nav = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.location.trim()) params.set('location', filters.location.trim());
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.property_type) params.set('property_type', filters.property_type);
    if (filters.guests) params.set('guests', filters.guests);
    if (filters.checkin_date) params.set('checkin_date', filters.checkin_date);
    if (filters.checkout_date) params.set('checkout_date', filters.checkout_date);
    if (filters.verification_status) params.set('verification_status', filters.verification_status);
    if (filters.availability_status) params.set('availability_status', filters.availability_status);
    if (filters.min_rating) params.set('min_rating', filters.min_rating);
    
    const query = params.toString();
    api.get(`/properties${query ? `?${query}` : ''}`)
      .then(r => setProperties(r.data.properties || r.data || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      load();
    }, 400); // 400ms delay to avoid spamming the backend while typing
    return () => clearTimeout(delayDebounceFn);
  }, [load]);

  // Backend does the heavy lifting, we only sort client-side
  let filtered = properties.filter(p => p.is_approved);

  // Sort
  if (filters.sort === 'price_asc') filtered = [...filtered].sort((a, b) => Number(a.price_per_night) - Number(b.price_per_night));
  else if (filters.sort === 'price_desc') filtered = [...filtered].sort((a, b) => Number(b.price_per_night) - Number(a.price_per_night));
  else if (filters.sort === 'rating') filtered = [...filtered].sort((a, b) => Number(b.overall_score || 0) - Number(a.overall_score || 0));
  else filtered = [...filtered].sort((a, b) => b.property_id - a.property_id);

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== 'sort' && k !== 'location').length;

  const resetFilters = () => setFilters({ 
    location: '', 
    min_price: '', 
    max_price: '', 
    property_type: '', 
    guests: '', 
    checkin_date: '',
    checkout_date: '',
    verification_status: '',
    availability_status: '',
    min_rating: '',
    sort: 'newest' 
  });

  const Layout = publicMode ? PublicLayout : DashboardLayout;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div className="page-title">Browse Properties</div>
          <div className="page-subtitle">Find your perfect stay in Sri Lanka</div>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          {filtered.length} {filtered.length === 1 ? 'property' : 'properties'} found
        </span>
      </div>

      {/* Search + Filter bar */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input className="form-input" placeholder="Search by title or location..."
              value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && load()}
              style={{ paddingLeft: 36, margin: 0 }} />
          </div>
          <select className="form-input" value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
            style={{ width: 160, margin: 0 }}>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button className="btn-outline" onClick={() => setShowFilter(!showFilter)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
            <Filter size={14} /> Filters {activeFilters > 0 && <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{activeFilters}</span>}
          </button>
          <button className="btn-primary" onClick={load} style={{ whiteSpace: 'nowrap' }}>Search</button>
        </div>

        {/* Expandable filters */}
        {showFilter && (
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 14, paddingTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div>
              <label className="form-label">Property Type</label>
              <select className="form-input" value={filters.property_type} onChange={e => setFilters(f => ({ ...f, property_type: e.target.value }))}>
                <option value="">All Types</option>
                {PROPERTY_TYPES.slice(1).map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Min Price (Rs.)</label>
              <input className="form-input" type="number" placeholder="0" value={filters.min_price} onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Max Price (Rs.)</label>
              <input className="form-input" type="number" placeholder="Any" value={filters.max_price} onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Min Guests</label>
              <input className="form-input" type="number" placeholder="1" min="1" value={filters.guests} onChange={e => setFilters(f => ({ ...f, guests: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Check-in</label>
              <input className="form-input" type="date" value={filters.checkin_date} onChange={e => setFilters(f => ({ ...f, checkin_date: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Check-out</label>
              <input className="form-input" type="date" value={filters.checkout_date} onChange={e => setFilters(f => ({ ...f, checkout_date: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Verification</label>
              <select className="form-input" value={filters.verification_status} onChange={e => setFilters(f => ({ ...f, verification_status: e.target.value }))}>
                <option value="">Any Status</option>
                <option value="verified">Verified Only</option>
                <option value="not_verified">Unverified Only</option>
              </select>
            </div>
            <div>
              <label className="form-label">Availability</label>
              <select className="form-input" value={filters.availability_status} onChange={e => setFilters(f => ({ ...f, availability_status: e.target.value }))}>
                <option value="">Any Availability</option>
                <option value="available">Available Dates</option>
                <option value="booked">Fully Booked</option>
              </select>
            </div>
            <div>
              <label className="form-label">Min Rating</label>
              <select className="form-input" value={filters.min_rating} onChange={e => setFilters(f => ({ ...f, min_rating: e.target.value }))}>
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
            {activeFilters > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button className="btn-outline" onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}>
                  <X size={13} /> Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏠</div>
          <p>Loading properties...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>No properties found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search or removing filters</p>
          {activeFilters > 0 && <button className="btn-outline" style={{ marginTop: 14 }} onClick={resetFilters}>Clear Filters</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map(p => (
            <div key={p.property_id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
              onClick={() => nav(publicMode ? `/browse/property/${p.property_id}` : `/guest/property/${p.property_id}`)}>

              <div style={{ height: 170, background: '#e5e7eb', position: 'relative' }}>
                {(() => {
                  const primary = p.images?.find(i => i.is_primary) || p.images?.[0];
                  const src = primary ? getImageUrl(primary.image_url) : getImageUrl(p.image);
                  return src
                    ? <img src={src} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e3a8a22,#1e3a8a44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>🏠</div>;
                })()}

                {p.verification_badge && (
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--primary)', color: 'white', borderRadius: 16, padding: '4px 10px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    <BadgeCheck size={12} /> Verified
                  </div>
                )}
                {p.available_dates_count === 0 && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#dc2626', color: 'white', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Fully Booked
                  </div>
                )}
                {p.property_type && (
                  <span style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 600, textTransform: 'capitalize' }}>{p.property_type}</span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{p.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <MapPin size={11} />{p.address}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 600, fontSize: 12 }}>{p.overall_score || '—'}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 2 }}>({p.Reviews?.length || p.reviews?.length || 0})</span>
                    </div>
                    {p.max_guests && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)', fontSize: 11 }}>
                        <Users size={11} />{p.max_guests}
                      </div>
                    )}
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
    </Layout>
  );
}
