import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { ArrowLeft, Upload } from 'lucide-react';

export default function PropertyForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ title: '', description: '', address: '', price_per_night: '', max_guests: '' });
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) api.get(`/properties/${id}`).then(r => { const p = r.data; setForm({ title: p.title, description: p.description, address: p.address, price_per_night: p.price_per_night, max_guests: p.max_guests }); }).catch(() => {});
  }, [id]);

  const submit = async e => {
    e.preventDefault(); setMsg(''); setLoading(true);
    try {
      let propertyId = id;
      if (isEdit) { await api.put(`/properties/${id}`, form); }
      else { const res = await api.post('/properties', form); propertyId = res.data.property?.property_id || res.data.property_id; }
      if (image && propertyId) {
        const fd = new FormData(); fd.append('image', image);
        await api.post(`/properties/${propertyId}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setMsg(isEdit ? 'Property updated!' : 'Property created!');
      setTimeout(() => nav('/host/listings'), 1500);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <button onClick={() => nav(-1)} style={{ background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontWeight: 500, cursor: 'pointer' }}>
        <ArrowLeft size={16} /> Back to Listings
      </button>
      <div className="page-header">
        <div className="page-title">{isEdit ? 'Edit Property' : 'Add New Property'}</div>
        <div className="page-subtitle">{isEdit ? 'Update your property details' : 'List a new property'}</div>
      </div>
      <div style={{ maxWidth: 640 }}>
        <div className="card">
          {msg && <div className={`alert ${msg.includes('!') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={submit}>
            <div className="form-group"><label className="form-label">Property Title</label><input className="form-input" placeholder="e.g. Luxury Downtown Loft" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={4} placeholder="Describe your property..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" placeholder="Full address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Price per Night (Rs.)</label><input className="form-input" type="number" placeholder="5000" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Max Guests</label><input className="form-input" type="number" placeholder="4" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: e.target.value })} required /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Property Image</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }} onClick={() => document.getElementById('img-upload').click()}>
                {image ? <div style={{ color: 'var(--accent)', fontWeight: 600 }}>✓ {image.name}</div>
                  : <><Upload size={24} color="var(--text-muted)" style={{ marginBottom: 8 }} /><div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Click to upload image</div></>}
              </div>
              <input id="img-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImage(e.target.files[0])} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: 12 }}>{loading ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}</button>
              <button className="btn-outline" type="button" onClick={() => nav(-1)} style={{ padding: '12px 20px' }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
