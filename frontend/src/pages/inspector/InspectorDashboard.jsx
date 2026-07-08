import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function InspectorDashboard() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadAll = () => {
    Promise.allSettled([
      api.get('/inspector/dashboard'),
      api.get('/inspector/history')
    ]).then(([statRes, histRes]) => {
      if (statRes.status === 'fulfilled') setStats(statRes.value.data);
      if (histRes.status === 'fulfilled') {
        const hData = histRes.value.data?.inspections || histRes.value.data || [];
        setHistory(hData.slice(0, 3));
      }
    }).finally(() => setLoading(false));
  };
  
  useEffect(loadAll, []);

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">Verifier Dashboard</div>
        <div className="page-subtitle">Review and verify property listings</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Pending Verification</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{stats?.pending_in_queue || 0}</span>
                <div style={{ width: 36, height: 36, background: '#1e3a8a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color="white" />
                </div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Approved Today</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{stats?.approved_today || 0}</span>
                <div style={{ width: 36, height: 36, background: '#059669', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={20} color="white" />
                </div>
              </div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Real-time updates</span>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Rejected/Revoked Today</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 24, fontWeight: 800 }}>{stats?.rejected_today || 0}</span>
                <div style={{ width: 36, height: 36, background: '#1f2937', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={20} color="white" />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Task Overview */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Today's Task Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Properties to Review</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>New submissions awaiting verification</div>
                </div>
                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 16 }}>{stats?.pending_in_queue || 0}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Documents to Check</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Properties currently under review</div>
                </div>
                <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 16 }}>{stats?.pending_in_queue || 0}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Scheduled Inspections</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upcoming on-site property checks</div>
                </div>
                <div style={{ fontWeight: 700, color: '#374151', fontSize: 16 }}>{stats?.scheduled || 0}</div>
              </div>
            </div>
          </div>

          {/* Recent Verification Activity */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Verification Activity</h3>
            {history.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent activity.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map(item => {
                  const prop = item.property || item.Property || {};
                  const isApproved = item.recommendation === 'approve' || prop.verification_badge;
                  const isRevoked = item.recommendation === 'revoked';
                  return (
                    <div key={item.inspection_id} style={{ 
                      background: isApproved ? '#ecfdf5' : isRevoked ? '#fff1f2' : '#fef2f2', 
                      border: `1px solid ${isApproved ? '#a7f3d0' : isRevoked ? '#fecdd3' : '#fecaca'}`, 
                      padding: 16, borderRadius: 8, display: 'flex', gap: 16, alignItems: 'center' 
                    }}>
                      <div style={{ background: 'white', padding: 10, borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        {isApproved ? <CheckCircle size={20} color="#059669" /> : isRevoked ? <AlertTriangle size={20} color="#e11d48" /> : <XCircle size={20} color="#dc2626" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: isApproved ? '#065f46' : isRevoked ? '#be123c' : '#991b1b' }}>
                          {isApproved ? 'Approved' : isRevoked ? 'Revoked' : 'Rejected'}: {prop.title || `Property #${item.property_id}`}
                        </div>
                        <div style={{ fontSize: 12, color: isApproved ? '#047857' : isRevoked ? '#9f1239' : '#b91c1c', marginTop: 2 }}>
                          {isApproved ? 'Verified by you' : (item.notes || 'No reason provided')} • {item.completed_date?.substring(0, 10)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ready to Start? */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: 4 }}>Ready to Start?</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Review pending properties and help hosts get verified</div>
            </div>
            <button className="btn-primary" onClick={() => navigate('/inspector/pending')} style={{ background: '#1e3a8a', padding: '10px 20px' }}>
              Go to Queue
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
