import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Star } from 'lucide-react';

export default function HostReviews() {
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [response, setResponse] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/properties/host/my-properties').then(async r => {
      const props = r.data || [];
      setProperties(props);
      const all = [];
      for (const p of props) {
        const rv = await api.get(`/reviews/property/${p.property_id}`).then(x => x.data || []).catch(() => []);
        rv.forEach(r => { r._property_title = p.title; });
        all.push(...rv);
      }
      setReviews(all);
    }).catch(() => {});
  }, []);

  const respond = async (reviewId) => {
    try {
      await api.put(`/reviews/${reviewId}/respond`, { host_response: response[reviewId] });
      setMsg('Response submitted!');
      setResponse(prev => ({ ...prev, [reviewId]: '' }));
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Reviews</div><div className="page-subtitle">Guest reviews for your properties</div></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}><Star size={40} style={{ marginBottom: 12, opacity: 0.4 }} /><p>No reviews yet.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reviews.map(r => (
            <div key={r.review_id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{r._property_title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.review_date}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} color={i < r.rating ? '#f59e0b' : '#e5e7eb'} fill={i < r.rating ? '#f59e0b' : '#e5e7eb'} />)}
              </div>
              <p style={{ fontSize: 13, marginBottom: 12 }}>{r.comment}</p>
              {r.host_response ? (
                <div style={{ background: '#f0f7ff', borderRadius: 8, padding: 10, fontSize: 13 }}><strong>Your response:</strong> {r.host_response}</div>
              ) : (
                <div>
                  <textarea className="form-input" rows={2} placeholder="Write a response..." value={response[r.review_id] || ''} onChange={e => setResponse(prev => ({ ...prev, [r.review_id]: e.target.value }))} style={{ marginBottom: 8, resize: 'vertical' }} />
                  <button className="btn-primary btn-sm" onClick={() => respond(r.review_id)}>Respond</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
