import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { getImageUrl } from '../../utils';
import { Plus, Edit2, Calendar, Trash2, Star, MapPin, CheckCircle2 } from 'lucide-react';

export default function HostListings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const [showVerifySuccess, setShowVerifySuccess] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const load = () => { api.get('/properties/host/my-properties').then(r => setProperties(r.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try { 
      await api.delete(`/properties/${deleteModal.property_id}`); 
      load(); 
      setDeleteModal(null);
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to delete property'); 
    }
  };

  const requestVerification = async (id) => {
    try { 
      await api.put(`/properties/${id}/request-verification`); 
      load(); 
      setShowVerifySuccess(true);
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed'); 
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">My Listings</div><div className="page-subtitle">Manage your property listings</div></div>
        <button className="btn-primary" onClick={() => nav('/host/listings/new')}><Plus size={15} /> Add New Property</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
        : properties.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>List a New Property</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Expand your portfolio and increase your earnings</p>
            <button className="btn-primary" onClick={() => nav('/host/listings/new')}><Plus size={15} /> Get Started</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {properties.map(p => (
              <div key={p.property_id} className="card" style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 20, alignItems: 'center' }}>
                <div style={{ borderRadius: 10, overflow: 'hidden', height: 110, background: '#e5e7eb', position: 'relative' }}>
                  {(() => {
                    const primary = p.images?.find(i => i.is_primary) || p.images?.[0];
                    const src     = primary ? getImageUrl(primary.image_url) : getImageUrl(p.image);
                    return src
                      ? <img src={src} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1e3a8a22,#1e3a8a44)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🏠</div>;
                  })()}
                  {p.images?.length > 0 && (
                    <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 600 }}>
                      {p.images.length} photo{p.images.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</span>
                    {p.verification_badge ? (
                      <span className="badge badge-success" style={{ background: '#d1fae5', color: '#059669', padding: '4px 8px' }}>Verified</span>
                    ) : p.verification_status === 'rejected' ? (
                      <span className="badge badge-error" style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px' }}>Verification Rejected</span>
                    ) : p.verification_status === 'inspecting' ? (
                      <span className="badge badge-warning" style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 8px' }}>Inspection in Progress</span>
                    ) : p.verification_status === 'requested' ? (
                      <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px' }}>Verification Pending</span>
                    ) : (
                      <span className="badge" style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 8px' }}>Unverified</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}><MapPin size={11} />{p.address}</div>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                    <span>Price <strong>Rs.{Number(p.price_per_night).toLocaleString()}/night</strong></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Rating <Star size={12} color="#f59e0b" fill="#f59e0b" /><strong>{p.overall_score || '—'}</strong></span>
                    <span>Status <strong style={{ color: !p.is_approved ? 'var(--accent-orange)' : p.available_dates_count === 0 ? '#dc2626' : 'var(--accent)' }}>
                      {!p.is_approved ? 'Pending Approval' : p.available_dates_count === 0 ? 'Fully Booked' : `Available (${p.available_dates_count} dates)`}
                    </strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                  <button className="btn-primary btn-sm" style={{ justifyContent: 'center' }} onClick={() => nav(`/host/listings/edit/${p.property_id}`)}><Edit2 size={12} /> Edit Details</button>
                  <button className="btn-outline btn-sm" style={{ justifyContent: 'center' }} onClick={() => nav(`/host/calendar?property=${p.property_id}`)}><Calendar size={12} /> Manage Calendar</button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => nav(`/host/bookings`)}>View Bookings</button>
                    <button style={{ background: 'none', border: '1.5px solid #fee2e2', borderRadius: 8, padding: '5px 10px', color: 'var(--accent-red)', cursor: 'pointer' }} onClick={() => setDeleteModal(p)}><Trash2 size={14} /></button>
                  </div>
                  {(!p.verification_badge && !['requested', 'inspecting'].includes(p.verification_status)) && (
                    <button className="btn-outline btn-sm" style={{ justifyContent: 'center', fontSize: 11, border: '1px solid #d97706', color: '#d97706', background: '#fffbeb' }} onClick={() => requestVerification(p.property_id)}>
                      Request Verification
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* New listing CTA */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f7ff', border: '1px solid #bfdbfe' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>List a New Property</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Expand your portfolio and increase your earnings</div>
              </div>
              <button className="btn-primary" onClick={() => nav('/host/listings/new')}><Plus size={14} /> Get Started</button>
            </div>
          </div>
        )}
        
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111827' }}>Delete Property?</h2>
            <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deleteModal.title}</strong>? This action cannot be undone and will cancel any active bookings.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={confirmDelete} style={{ flex: 1, background: '#ef4444', justifyContent: 'center' }}>
                Yes, Delete
              </button>
              <button className="btn-outline" onClick={() => setDeleteModal(null)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Success Modal */}
      {showVerifySuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '40px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <CheckCircle2 size={64} color="#10b981" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#111827' }}>Verification Requested!</h2>
            <p style={{ color: '#4b5563', fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>
              Your request has been successfully submitted to our Field Inspectors. We will notify you once the inspection is complete.
            </p>
            <button className="btn-primary" onClick={() => setShowVerifySuccess(false)} style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15 }}>
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
