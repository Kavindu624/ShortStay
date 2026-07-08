import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { getImageUrl } from '../../utils';
import { ArrowLeft, Upload, X, Star, ImagePlus, CheckCircle2 } from 'lucide-react';

export default function PropertyForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', description: '', address: '', price_per_night: '',
    max_guests: '', bedrooms: '1', property_type: 'apartment',
  });
  const [msg, setMsg]         = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ── Multi-image state ─────────────────────────────────────────────────────
  // newFiles: File[] — images the host picked but not yet uploaded
  // existingImages: {image_id, image_url, is_primary}[] — already on server
  const [newFiles, setNewFiles]           = useState([]);
  const [newPreviews, setNewPreviews]     = useState([]); // object-URLs for preview
  const [existingImages, setExistingImages] = useState([]);

  // ── Load property on edit ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/properties/${id}`).then(r => {
      const p = r.data;
      setForm({
        title:           p.title           || '',
        description:     p.description     || '',
        address:         p.address         || '',
        price_per_night: p.price_per_night || '',
        max_guests:      p.max_guests      || '',
        bedrooms:        p.bedrooms        || '1',
        property_type:   p.property_type   || 'apartment',
      });
      setExistingImages(p.images || []);
    }).catch(() => {});
  }, [id, isEdit]);

  // Revoke object URLs on unmount to free memory
  useEffect(() => {
    return () => newPreviews.forEach(URL.revokeObjectURL);
  }, [newPreviews]);

  // ── File picker handler ───────────────────────────────────────────────────
  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files);
    const total  = existingImages.length + newFiles.length + picked.length;
    if (total > 10) {
      setMsg(`Maximum 10 images allowed. You can add ${10 - existingImages.length - newFiles.length} more.`);
      return;
    }
    const previews = picked.map(f => URL.createObjectURL(f));
    setNewFiles(prev   => [...prev, ...picked]);
    setNewPreviews(prev => [...prev, ...previews]);
    setMsg('');
    e.target.value = '';          // allow re-picking same file
  };

  // Remove a newly-added (not yet uploaded) file
  const removeNewFile = (idx) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles(prev    => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Delete an already-uploaded image from the server
  const deleteExisting = async (imageId) => {
    try {
      await api.delete(`/properties/${id}/images/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.image_id !== imageId));
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to delete image');
    }
  };

  // Set primary image on the server
  const setPrimary = async (imageId) => {
    try {
      await api.put(`/properties/${id}/primary-image`, { image_id: imageId });
      setExistingImages(prev =>
        prev.map(img => ({ ...img, is_primary: img.image_id === imageId }))
      );
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to set primary image');
    }
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setLoading(true);
    try {
      let propertyId = id;

      // 1. Create or update property details
      if (isEdit) {
        await api.put(`/properties/${id}`, form);
      } else {
        const res  = await api.post('/properties', form);
        propertyId = res.data.property?.property_id || res.data.property_id;
      }

      // 2. Upload any newly-selected images
      if (newFiles.length > 0 && propertyId) {
        const fd = new FormData();
        newFiles.forEach(f => fd.append('images', f));
        await api.post(`/properties/${propertyId}/upload`, fd);
        setNewFiles([]);
        setNewPreviews([]);

        // Refresh existing images list if editing
        if (isEdit) {
          const r = await api.get(`/properties/${propertyId}`);
          setExistingImages(r.data.images || []);
        }
      }

      setMsg('');
      setShowSuccessModal(true);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save property');
    } finally { setLoading(false); }
  };

  const totalImages = existingImages.length + newFiles.length;
  const canAddMore  = totalImages < 10;

  return (
    <DashboardLayout>
      <button onClick={() => nav(-1)} style={{ background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontWeight: 500, cursor: 'pointer' }}>
        <ArrowLeft size={16} /> Back to Listings
      </button>

      <div className="page-header">
        <div className="page-title">{isEdit ? 'Edit Property' : 'Add New Property'}</div>
        <div className="page-subtitle">{isEdit ? 'Update your property details' : 'List a new property on ShortStay'}</div>
      </div>

      <div style={{ maxWidth: 720 }}>
        <div className="card">
          {msg && (
            <div className={`alert ${msg.includes('!') || msg.includes('created') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>
              {msg}
            </div>
          )}

          <form onSubmit={submit}>
            {/* ── Basic Details ─────────────────────────────────── */}
            <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Property Details</h3>

            <div className="form-group">
              <label className="form-label">Property Title</label>
              <input className="form-input" placeholder="e.g. Luxury Beachfront Villa in Galle" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={4} placeholder="Describe your property, amenities, and surroundings…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" placeholder="Full address including city" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Price per Night (Rs.)</label>
                <input className="form-input" type="number" min="1" placeholder="5000" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Max Guests</label>
                <input className="form-input" type="number" min="1" placeholder="4" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: e.target.value })} required />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <input className="form-input" type="number" min="1" placeholder="2" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Property Type</label>
                <select className="form-input" value={form.property_type} onChange={e => setForm({ ...form, property_type: e.target.value })}>
                  {['apartment','house','villa','room','bungalow','cabin'].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Images Section ────────────────────────────────── */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Property Photos</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {totalImages}/10 images • First image (★) is shown as the cover photo
                  </p>
                </div>
                {canAddMore && (
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => document.getElementById('img-upload').click()}
                  >
                    <ImagePlus size={14} /> Add Photos
                  </button>
                )}
              </div>

              <input
                id="img-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                style={{ display: 'none' }}
                onChange={handleFilePick}
              />

              {/* Image grid */}
              {totalImages === 0 ? (
                /* Empty state — big drop zone */
                <div
                  style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'border-color 0.2s' }}
                  onClick={() => document.getElementById('img-upload').click()}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Upload size={28} color="var(--text-muted)" style={{ marginBottom: 10 }} />
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Click to upload property photos</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG or PNG • Max 5MB each • Up to 10 photos</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                  {/* Existing images (already on server) */}
                  {existingImages.map((img, idx) => (
                    <div key={img.image_id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: img.is_primary ? '2px solid var(--primary)' : '2px solid var(--border)', aspectRatio: '4/3' }}>
                      <img
                        src={getImageUrl(img.image_url)}
                        alt={`Photo ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Primary badge */}
                      {img.is_primary && (
                        <div style={{ position: 'absolute', top: 4, left: 4, background: 'var(--primary)', color: 'white', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star size={9} fill="white" /> Cover
                        </div>
                      )}
                      {/* Actions overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: 6 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                      >
                        {isEdit && !img.is_primary && (
                          <button
                            type="button"
                            title="Set as cover photo"
                            onClick={() => setPrimary(img.image_id)}
                            style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}
                          >
                            <Star size={9} /> Cover
                          </button>
                        )}
                        {isEdit && (
                          <button
                            type="button"
                            title="Delete image"
                            onClick={() => deleteExisting(img.image_id)}
                            style={{ background: '#ef4444', border: 'none', borderRadius: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 'auto' }}
                          >
                            <X size={12} color="white" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* New files (pending upload) */}
                  {newPreviews.map((src, idx) => (
                    <div key={`new-${idx}`} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '2px dashed #10b981', aspectRatio: '4/3' }}>
                      <img src={src} alt={`New ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                      <div style={{ position: 'absolute', top: 4, left: 4, background: '#10b981', color: 'white', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 700 }}>
                        New
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewFile(idx)}
                        style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', border: 'none', borderRadius: 4, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={11} color="white" />
                      </button>
                    </div>
                  ))}

                  {/* Add more tile */}
                  {canAddMore && (
                    <div
                      style={{ border: '2px dashed var(--border)', borderRadius: 8, aspectRatio: '4/3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f9fafb', gap: 6, transition: 'border-color 0.2s' }}
                      onClick={() => document.getElementById('img-upload').click()}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <ImagePlus size={20} color="var(--text-muted)" />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Add more</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Submit ────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: 13 }}>
                {loading
                  ? (newFiles.length > 0 ? `Uploading ${newFiles.length} photo(s)…` : 'Saving…')
                  : (isEdit ? 'Save Changes' : 'Create Property')}
              </button>
              <button className="btn-outline" type="button" onClick={() => nav(-1)} style={{ padding: '13px 20px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '40px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <CheckCircle2 size={64} color="#10b981" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#111827' }}>
              {isEdit ? 'Property Updated!' : 'Property Created!'}
            </h2>
            <p style={{ color: '#4b5563', fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>
              {isEdit 
                ? 'Your property details and images have been successfully updated.' 
                : 'Your new property has been submitted and will be visible to guests after admin approval.'}
            </p>
            <button className="btn-primary" onClick={() => nav('/host/listings')} style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 15 }}>
              Return to Listings
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
