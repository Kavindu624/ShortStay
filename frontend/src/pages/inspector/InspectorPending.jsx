import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { showAlert } from '../../utils/alert';
import { MapPin, Image as ImageIcon, FileText, CheckCircle, XCircle, Calendar, UploadCloud, FileVideo } from 'lucide-react';

export default function InspectorPending() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [photoModal, setPhotoModal] = useState(null);
  
  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  
  const [conductModal, setConductModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  
  const [confirmModal, setConfirmModal] = useState(null);
  const [successModal, setSuccessModal] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/inspector/pending')
      .then(r => setProperties(r.data?.properties || r.data || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSchedule = async () => {
    if (!scheduledDate) return showAlert('Please select a date');
    setSubmitting(true);
    try {
      await api.post('/inspector/schedule', {
        property_id: scheduleModal.property_id,
        scheduled_date: scheduledDate
      });
      setMsg('Inspection scheduled successfully!');
      setTimeout(() => { setMsg(''); setScheduleModal(null); load(); }, 1500);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to schedule');
    } finally { setSubmitting(false); }
  };

  const handleConduct = async (result) => {
    if (!notes || notes.trim() === '') {
      showAlert('Inspection Notes & Recommendations are required.');
      return;
    }
    if (images.length === 0) {
      showAlert('At least one evidence photo is required.');
      return;
    }
    // Open confirmation modal instead of native confirm
    setConfirmModal({ ...conductModal, result });
  };

  const executeConduct = async () => {
    setSubmitting(true); setMsg('');
    const { result, property_id } = confirmModal;
    
    try {
      // 1. Submit the report to create/update inspection record
      const r = await api.post('/inspector/submit', {
        property_id: property_id,
        result: result,
        notes: notes || (result === 'passed' ? 'Property meets all verification standards.' : 'Failed verification checklist.'),
        overall_score: result === 'passed' ? 5.0 : 2.0
      });

      // 2. Upload images if any
      if (images.length > 0) {
        const formData = new FormData();
        Array.from(images).forEach(i => formData.append('images', i));
        await api.post(`/inspector/${r.data.inspection.inspection_id}/images`, formData);
      }

      setConfirmModal(null);
      setConductModal(null);
      setImages([]);
      setNotes('');
      setSuccessModal({ result });
      load();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Submission failed');
      setConfirmModal(null);
    } finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">Verification Queue</div>
        <div className="page-subtitle">Review, schedule, and conduct property inspections</div>
      </div>

      {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 20 }}>{msg}</div>}

      {/* Success Modal */}
      {successModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '40px 20px' }}>
            {successModal.result === 'passed' ? (
              <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 20px' }} />
            ) : (
              <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 20px' }} />
            )}
            <h2 style={{ marginBottom: 12, fontSize: 24, color: '#111827' }}>
              {successModal.result === 'passed' ? 'Property Approved!' : 'Property Rejected'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              {successModal.result === 'passed' 
                ? 'The property has been successfully verified and the badge has been awarded.' 
                : 'The property has been rejected. The host will be notified to make the requested changes.'}
            </p>
            <button className="btn-primary" onClick={() => setSuccessModal(null)} style={{ width: '100%', justifyContent: 'center' }}>Continue</button>
          </div>
        </div>
      )}



      {/* Confirm Action Modal */}
      {confirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: confirmModal.result === 'passed' ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
               {confirmModal.result === 'passed' ? <CheckCircle size={24} color="#10b981" /> : <XCircle size={24} color="#ef4444" />}
            </div>
            <h3 style={{ marginBottom: 12, fontSize: 20 }}>Confirm {confirmModal.result === 'passed' ? 'Approval' : 'Rejection'}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
              Are you sure you want to {confirmModal.result === 'passed' ? 'approve' : 'reject'} this property? This action will notify the host immediately.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                className="btn-primary" 
                onClick={executeConduct} 
                disabled={submitting} 
                style={{ flex: 1, background: confirmModal.result === 'passed' ? '#10b981' : '#ef4444' }}>
                {submitting ? 'Processing...' : `Yes, ${confirmModal.result === 'passed' ? 'Approve' : 'Reject'}`}
              </button>
              <button className="btn-outline" onClick={() => setConfirmModal(null)} disabled={submitting} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90%' }}>
            <h3 style={{ marginBottom: 16 }}>Schedule Inspection</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Select a date to inspect <strong>{scheduleModal.title}</strong>.</p>
            <div className="form-group">
              <label className="form-label">Inspection Date</label>
              <input type="date" className="form-input" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={handleSchedule} disabled={submitting} style={{ flex: 1 }}>Confirm Schedule</button>
              <button className="btn-outline" onClick={() => setScheduleModal(null)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Conduct Inspection Modal */}
      {conductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 8, fontSize: 22 }}>Conduct Inspection</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Upload evidence and submit your final verdict for <strong>{conductModal.title}</strong>.</p>
            
            <div className="form-group">
              <label className="form-label">Inspection Notes & Recommendations <span style={{color: 'red'}}>*</span></label>
              <textarea className="form-input" rows={4} placeholder="Describe the condition, safety issues, or positive remarks..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Upload Evidence Photos (Max 5) <span style={{color: 'red'}}>*</span></label>
              <div style={{ border: '2px dashed var(--border)', padding: 32, borderRadius: 8, textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }} onClick={() => document.getElementById('evidenceUpload').click()}>
                <UploadCloud size={32} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Click to upload images</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>JPG, PNG up to 5MB</div>
                <input id="evidenceUpload" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => setImages(Array.from(e.target.files).slice(0, 5))} />
              </div>
              {images.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={URL.createObjectURL(img)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setImages(images.filter((_, i) => i !== idx)); }}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: '#10b981', marginTop: 8, fontWeight: 600 }}>{images.length} image{images.length > 1 ? 's' : ''} selected.</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn-primary" onClick={() => handleConduct('passed')} disabled={submitting} style={{ flex: 1, background: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} /> Approve Property
              </button>
              <button className="btn-primary" onClick={() => handleConduct('failed')} disabled={submitting} style={{ flex: 1, background: '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                <XCircle size={16} /> Reject & Request Changes
              </button>
            </div>
            <button className="btn-outline" onClick={() => { setConductModal(null); setImages([]); setNotes(''); }} style={{ width: '100%', marginTop: 12 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {photoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyItems: 'center', padding: 40, flexDirection: 'column' }}>
          <div style={{ width: '100%', maxWidth: 800, display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setPhotoModal(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><XCircle size={32} /></button>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, width: '100%', maxWidth: 800, maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: 16 }}>Photos for {photoModal.title}</h3>
            {photoModal.images && photoModal.images.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {photoModal.images.map((img, idx) => (
                  <img key={idx} src={img.image_url.startsWith('http') ? img.image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/properties/${img.image_url}`} alt={`Property ${idx}`} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }} />
                ))}
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No additional photos uploaded.</div>
            )}
          </div>
        </div>
      )}



      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <CheckCircle size={44} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>Queue is empty</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>All pending properties have been reviewed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {properties.map(p => {
            const images = p.images || [];
            let mainImg = 'https://placehold.co/600x400?text=No+Image';
            if (p.image) {
              mainImg = p.image.startsWith('http') ? p.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/properties/${p.image}`;
            } else if (images.length > 0) {
              mainImg = images[0].image_url.startsWith('http') ? images[0].image_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/properties/${images[0].image_url}`;
            }
            
            const isScheduled = p.verification_status === 'inspecting';

            return (
              <div key={p.property_id} className="card" style={{ display: 'flex', gap: 24, padding: 24 }}>
                {/* Left: Image & Buttons */}
                <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', background: '#f3f4f6' }}>
                    <img src={mainImg} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-outline" onClick={() => setPhotoModal(p)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12 }}>
                      <ImageIcon size={14} /> View Photos ({images.length})
                    </button>
                  </div>
                </div>

                {/* Right: Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{p.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                        <MapPin size={14} /> {p.address}
                      </div>
                    </div>
                    <span className={`badge ${isScheduled ? 'badge-info' : 'badge-warning'}`} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>
                      {isScheduled ? 'Inspection Scheduled' : 'Pending Schedule'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0', padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Host</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.host?.name || 'Unknown'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Price per Night</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{Number(p.price_per_night).toLocaleString()} LKR</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Property Type</div>
                      <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{p.property_type || 'Apartment'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Bedrooms</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.bedrooms || 2} Bedrooms</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, marginTop: 'auto' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Verification Actions:</div>
                    
                    {!isScheduled ? (
                      <button className="btn-primary" 
                        onClick={() => setScheduleModal(p)}
                        style={{ width: '100%', background: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                        <Calendar size={16} /> Schedule Inspection
                      </button>
                    ) : (
                      <button className="btn-primary" 
                        onClick={() => setConductModal(p)}
                        style={{ width: '100%', background: '#8b5cf6', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                        <FileVideo size={16} /> Conduct Inspection
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
