import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { DollarSign, Home, Star, Calendar, ArrowLeft } from 'lucide-react';

export default function AdminHostProfile() {
  const { id } = useParams();
  const [host, setHost] = useState(null);
  const [properties, setProperties] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch user details
        const userRes = await api.get(`/profile/${id}`);
        setHost(userRes.data);

        // Fetch properties and filter
        const propRes = await api.get('/admin/properties');
        const allProps = propRes.data || [];
        setProperties(allProps.filter(p => p.host_id === Number(id)));

        // Fetch payouts for this host
        const payoutRes = await api.get(`/payouts/host/${id}`);
        setPayouts(payoutRes.data?.payouts || payoutRes.data || []);
      } catch (err) {
        console.error('Error fetching host profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading host profile...</div>
      </DashboardLayout>
    );
  }

  if (!host) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-error)' }}>Host not found</div>
      </DashboardLayout>
    );
  }

  const totalEarnings = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.payout_amount), 0);

  const activeListings = properties.filter(p => p.is_approved).length;
  
  // Calculate average rating
  const ratings = properties.map(p => Number(p.overall_score || 0)).filter(r => r > 0);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 20 }}>
        <Link to="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Users
        </Link>
      </div>
      
      <div className="page-header">
        <div className="page-title">{host.name}'s Dashboard</div>
        <div className="page-subtitle">Host Performance & Overview</div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Earnings</div>
            <div className="stat-value">Rs.{totalEarnings.toLocaleString()}</div>
          </div>
          <div className="stat-icon" style={{ background: '#1e3a8a', color: 'white' }}>
            <DollarSign size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Active Listings</div>
            <div className="stat-value">{activeListings}</div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Home size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Upcoming Check-ins</div>
            <div className="stat-value">—</div> {/* Requires booking query which we skip for brevity */}
          </div>
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
            <Calendar size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Average Rating</div>
            <div className="stat-value">{avgRating}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Star size={20} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Properties ({properties.length})</h3>
        {properties.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>No properties found for this host.</div>
        ) : (
          <div className="grid-3">
            {properties.map(p => (
              <div key={p.property_id} style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ height: 160, background: '#f3f4f6', position: 'relative' }}>
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0].image_url?.startsWith('http') ? p.images[0].image_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/properties/${p.images[0].image_url}`}
                      alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Image</div>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</h4>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {p.address}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" /> {p.overall_score || 'New'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Rs.{p.price_per_night}/night</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
