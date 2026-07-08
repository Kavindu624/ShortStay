import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Download, Search, Filter, Eye, Edit, Ban, Star, XCircle } from 'lucide-react';

export default function InspectorHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Keeping it small to match the mockup style

  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [revokeModal, setRevokeModal] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/properties')
      .then(r => setHistory(r.data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  // Filter history by search term
  const filtered = history.filter(p => {
    const term = search.toLowerCase();
    return (p.title || '').toLowerCase().includes(term) || 
           (p.host?.name || '').toLowerCase().includes(term) ||
           (p.address || '').toLowerCase().includes(term);
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 on search
  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleEditNotes = async () => {
    if (!editNotes.trim()) return;
    setSubmitting(true);
    try {
      await api.put(`/inspector/properties/${editModal.property_id}/notes`, {
        recommendations: editNotes
      });
      setMsg('Verification notes updated successfully!');
      setEditModal(null);
      load();
    } catch (err) {
      alert('Failed to update notes');
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim()) return;
    setSubmitting(true);
    try {
      await api.put(`/inspector/properties/${revokeModal.property_id}/revoke`, {
        reason: revokeReason
      });
      setMsg('Verification badge revoked successfully!');
      setRevokeModal(null);
      load();
    } catch (err) {
      alert('Failed to revoke badge');
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="page-title">Properties Management</div>
          <div className="page-subtitle">Manage all properties on the platform</div>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e3a8a' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {msg && <div className={`alert alert-success`} style={{ marginBottom: 20 }}>{msg}</div>}

      <div className="card" style={{ padding: 0 }}>
        {/* Filters Bar */}
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', background: 'none', border: 'none', fontWeight: 600, fontSize: 14 }}>
            <Filter size={16} /> Filters:
          </button>
          <div style={{ width: 80, height: 38, border: '1px solid var(--border)', borderRadius: 8 }}></div>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search by property name or host..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', outline: 'none' }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No properties found.</div>
        ) : (
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 20px', color: '#1f2937', fontWeight: 700 }}>Property</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', color: '#1f2937', fontWeight: 700 }}>Host</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', color: '#1f2937', fontWeight: 700 }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', color: '#1f2937', fontWeight: 700 }}>Price/Night</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', color: '#1f2937', fontWeight: 700 }}>Rating</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', color: '#1f2937', fontWeight: 700 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', color: '#1f2937', fontWeight: 700 }}>Available</th>
                  <th style={{ textAlign: 'left', padding: '16px 20px', color: '#1f2937', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(p => {
                  const images = p.images || [];
                  let mainImg = 'https://placehold.co/100x70?text=No+Image';
                  if (p.image) {
                    mainImg = p.image.startsWith('http') ? p.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/properties/${p.image}`;
                  } else if (images.length > 0) {
                    mainImg = images[0].image_url.startsWith('http') ? images[0].image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/properties/${images[0].image_url}`;
                  }
                  
                  // Mock random reviews/rating based on property_id for display consistency
                  const rating = (4.0 + ((p.property_id || 1) % 10) * 0.1).toFixed(1);
                  const reviews = ((p.property_id || 1) * 17) % 150 + 20;

                  return (
                    <tr key={p.property_id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img src={mainImg} alt={p.title} style={{ width: 80, minWidth: 80, height: 56, flexShrink: 0, borderRadius: 6, objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: '#111827' }}>{p.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{reviews} reviews</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#374151' }}>{p.host?.name || 'Unknown'}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#374151' }}>{p.address}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: '#374151' }}>{Number(p.price_per_night || 0).toLocaleString()} LKR</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151' }}>
                          <Star size={14} color="#f59e0b" fill="#f59e0b" /> {rating}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {p.verification_badge ? (
                          <span className="badge badge-success" style={{ background: '#d1fae5', color: '#059669', padding: '4px 8px' }}>verified</span>
                        ) : p.verification_status === 'rejected' ? (
                          <span className="badge badge-error" style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 8px' }}>rejected</span>
                        ) : (
                          <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px' }}>pending</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: p.is_available ? '#059669' : '#dc2626' }}>
                        {p.is_available ? 'Yes' : 'No'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Eye size={16} onClick={() => setViewModal(p)} style={{ cursor: 'pointer', color: '#4b5563' }} />
                          <Edit size={16} onClick={() => { setEditModal(p); setEditNotes(p.recommendations || ''); }} style={{ cursor: 'pointer', color: '#4b5563' }} />
                          <Ban size={16} onClick={() => { setRevokeModal(p); setRevokeReason(''); }} style={{ cursor: 'pointer', color: '#ef4444' }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} properties
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button 
                  className="btn-outline" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  style={{ padding: '6px 12px', fontSize: 13, borderRadius: 4, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    className={currentPage === page ? "btn-primary" : "btn-outline"}
                    onClick={() => setCurrentPage(page)}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: 13, 
                      borderRadius: 4, 
                      background: currentPage === page ? '#1e3a8a' : 'transparent' 
                    }}>
                    {page}
                  </button>
                ))}
                <button 
                  className="btn-outline" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  style={{ padding: '6px 12px', fontSize: 13, borderRadius: 4, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Property Modal */}
      {viewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 600, maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{viewModal.title}</h2>
              <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XCircle size={24} color="#9ca3af" />
              </button>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              {viewModal.image && (
                <img 
                  src={viewModal.image.startsWith('http') ? viewModal.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/properties/${viewModal.image}`} 
                  alt={viewModal.title} 
                  style={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} 
                />
              )}
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Description</h3>
              <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{viewModal.description || 'No description provided.'}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{viewModal.address}</div>
                </div>
                <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Price per Night</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{Number(viewModal.price_per_night || 0).toLocaleString()} LKR</div>
                </div>
                <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Capacity</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{viewModal.max_guests} Guests, {viewModal.bedrooms} Bedrooms</div>
                </div>
                <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Host</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{viewModal.host?.name} ({viewModal.host?.email})</div>
                </div>
              </div>

              {viewModal.recommendations && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#059669' }}>Inspector Recommendations</h3>
                  <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', padding: 16, borderRadius: 8, color: '#065f46', fontSize: 14 }}>
                    {viewModal.recommendations}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Notes Modal */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 500, maxWidth: '90%' }}>
            <h2 style={{ marginBottom: 16, fontSize: 20 }}>Edit Verification Notes</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Update internal verification notes or recommendations for <strong>{editModal.title}</strong>.</p>
            
            <textarea
              className="input"
              rows={4}
              placeholder="Enter updated notes or recommendations..."
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              style={{ width: '100%', marginBottom: 24, resize: 'none' }}
            />
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={handleEditNotes} disabled={submitting || !editNotes.trim()} style={{ flex: 1, background: '#10b981' }}>
                {submitting ? 'Saving...' : 'Save Notes'}
              </button>
              <button className="btn-outline" onClick={() => setEditModal(null)} disabled={submitting} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Badge Modal */}
      {revokeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 500, maxWidth: '90%' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Ban size={24} color="#ef4444" />
            </div>
            <h2 style={{ marginBottom: 12, fontSize: 20, textAlign: 'center' }}>Revoke Verification?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
              Are you sure you want to revoke the verification badge for <strong>{revokeModal.title}</strong>? This will immediately notify the host.
            </p>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Reason for Revocation *</label>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. Failed secondary safety check, unresponsive host..."
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={handleRevoke} disabled={submitting || !revokeReason.trim()} style={{ flex: 1, background: '#ef4444' }}>
                {submitting ? 'Revoking...' : 'Yes, Revoke Badge'}
              </button>
              <button className="btn-outline" onClick={() => setRevokeModal(null)} disabled={submitting} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
