import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { ShieldCheck, CheckCircle2, XCircle, Clock, ClipboardList } from 'lucide-react';

export default function AdminVerifications() {
  const [stats, setStats] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get stats from admin dashboard endpoint
    api.get('/dashboard/admin').then(r => setStats(r.data)).catch(() => {});
    
    // Get all inspections history
    api.get('/inspector/all').then(r => {
      setInspections(r.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pendingApprovals = stats?.property_stats?.pending_verification ?? 0;
  const activeInspections = inspections.filter(i => i.status === 'scheduled' || i.status === 'in_progress').length;
  
  // Calculate today's stats from inspections
  const today = new Date().toDateString();
  const approvedToday = inspections.filter(i => 
    i.recommendation === 'approve' && new Date(i.completed_date || i.scheduled_date).toDateString() === today
  ).length;
  
  const rejectedToday = inspections.filter(i => 
    i.recommendation === 'reject' && new Date(i.completed_date || i.scheduled_date).toDateString() === today
  ).length;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="page-title">Verification Overview</div>
        <div className="page-subtitle">Review platform-wide property verification activity</div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Verification</div>
            <div className="stat-value">{pendingApprovals}</div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Clock size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Active Inspections</div>
            <div className="stat-value">{activeInspections}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <ClipboardList size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Approved Today</div>
            <div className="stat-value">{approvedToday}</div>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Rejected Today</div>
            <div className="stat-value">{rejectedToday}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <XCircle size={20} />
          </div>
        </div>
      </div>

      <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Verification Activity</h3>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
      ) : inspections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          No verification activity found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inspections.slice(0, 15).map(i => {
            const isApproved = i.recommendation === 'approve';
            return (
              <div key={i.inspection_id} className="card" style={{ 
                padding: '16px 20px', 
                background: isApproved ? '#f0fdf4' : '#fef2f2', 
                border: `1px solid ${isApproved ? '#bbf7d0' : '#fecaca'}`,
                display: 'flex', alignItems: 'center', gap: 16 
              }}>
                <div>
                  {isApproved ? <CheckCircle2 size={20} color="#16a34a" /> : <XCircle size={20} color="#dc2626" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>
                    {isApproved ? 'Approved' : 'Rejected'}: {i.Property?.title || `Property #${i.property_id}`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Verified by {i.inspector?.name || 'Unknown'} • {new Date(i.completed_date || i.scheduled_date).toLocaleDateString()}
                  </div>
                </div>
                {i.notes && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    "{i.notes}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
