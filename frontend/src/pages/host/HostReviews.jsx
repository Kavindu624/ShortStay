import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { showAlert } from '../../utils/alert';
import { Star, ThumbsUp } from 'lucide-react';

export default function HostReviews() {
  const [, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    // Manually load reviews for all properties since there's no dedicated aggregate endpoint
    api.get('/properties/host/my-properties').then(async r => {
      const props = r.data || [];
      setProperties(props);
      const allReviews = [];
      for (const p of props) {
        try {
          const res = await api.get(`/reviews/property/${p.property_id}`);
          const rv = res.data?.reviews || res.data || [];
          // If rv is an array
          if (Array.isArray(rv)) {
            rv.forEach(review => { 
              review._property_title = p.title; 
            });
            allReviews.push(...rv);
          }
        } catch (e) { void(e);
          // ignore
        }
      }
      // Sort all reviews by review_id desc (or date)
      allReviews.sort((a, b) => b.review_id - a.review_id);
      setReviews(allReviews);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Calculate aggregates
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : 0;
  
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
  });

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const handleHelpful = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      setReviews(reviews.map(r => r.review_id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const submitReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      await api.put(`/reviews/${reviewId}/respond`, { response: replyText });
      setReviews(reviews.map(r => r.review_id === reviewId ? { ...r, host_response: replyText } : r));
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to submit reply');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title">Reviews</div>
        <div className="page-subtitle">Guest feedback and ratings</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
          
          {/* Top Aggregate Card */}
          <div className="card" style={{ padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 60, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', minWidth: 200, flex: 1 }}>
              <div style={{ fontSize: 64, fontWeight: 800, color: '#1e3a8a', lineHeight: 1 }}>{avgRating}</div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', margin: '12px 0' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={22} color={i < Math.round(avgRating) ? '#f59e0b' : '#e5e7eb'} fill={i < Math.round(avgRating) ? '#f59e0b' : '#e5e7eb'} />
                ))}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
                {totalReviews} reviews across all properties
              </div>
            </div>

            <div style={{ flex: 2, minWidth: 300 }}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratingCounts[star];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 30, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                      {star} <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    </div>
                    <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#10b981', width: `${percentage}%`, borderRadius: 4 }}></div>
                    </div>
                    <div style={{ width: 24, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 800, padding: 24, borderBottom: '1px solid var(--border)', margin: 0 }}>
              Recent Reviews
            </h3>
            
            {totalReviews === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No reviews yet.</div>
            ) : (
              <div>
                {reviews.map((r, idx) => {
                  const guestName = r.Booking?.guest?.name || r.booking?.guest?.name || 'Guest';
                  return (
                    <div key={r.review_id} style={{ padding: 24, borderBottom: idx < reviews.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                            {getInitials(guestName)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{guestName}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{r._property_title}</div>
                            <p style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.5, margin: '0 0 12px 0' }}>{r.comment}</p>
                            <button onClick={() => handleHelpful(r.review_id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#1e3a8a', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                              <ThumbsUp size={14} /> Helpful {r.helpful_count > 0 ? `(${r.helpful_count})` : ''}
                            </button>
                            
                            <div style={{ marginTop: 12 }}>
                              {r.host_response ? (
                                <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '12px 16px', marginTop: 12 }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Your Response</div>
                                  <p style={{ fontSize: 13, margin: 0, color: 'var(--text-main)', lineHeight: 1.5 }}>{r.host_response}</p>
                                </div>
                              ) : replyingTo === r.review_id ? (
                                <div style={{ marginTop: 12 }}>
                                  <textarea className="form-input" rows={3} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your response to this review..." style={{ width: '100%', resize: 'vertical' }} />
                                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button className="btn-primary btn-sm" onClick={() => submitReply(r.review_id)}>Submit Reply</button>
                                    <button className="btn-outline btn-sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => { setReplyingTo(r.review_id); setReplyText(''); }} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, marginTop: 8 }}>
                                  Reply to Review
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end', marginBottom: 4 }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} color={i < r.rating ? '#f59e0b' : '#e5e7eb'} fill={i < r.rating ? '#f59e0b' : '#e5e7eb'} />
                            ))}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {r.review_date || r.createdAt?.substring(0, 10)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Performance Alert */}
          {totalReviews > 0 && Number(avgRating) >= 4.0 && (
            <div style={{ display: 'flex', gap: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 20, borderRadius: 12 }}>
              <div style={{ color: '#16a34a' }}>
                <Star size={24} />
              </div>
              <div>
                <h4 style={{ color: '#166534', margin: '0 0 4px 0', fontSize: 15, fontWeight: 700 }}>Excellent Performance!</h4>
                <p style={{ color: '#166534', margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                  Your average rating of {avgRating} is above the platform average. Keep up the great work!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
