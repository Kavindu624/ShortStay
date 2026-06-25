import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#1e3a8a','#10b981','#f59e0b','#6b7280'];

export default function AdminReports() {
  const [loading, setLoading] = useState(false);

  const occupancyData = MONTHS.map(m => ({ month: m, rate: Math.floor(Math.random()*20+70) }));
  const pieData = [{ name: 'Apartment', value: 45 },{ name: 'House', value: 30 },{ name: 'Villa', value: 15 },{ name: 'Other', value: 10 }];

  const genReport = async () => {
    setLoading(true);
    try { await api.get('/admin/report'); alert('Report generated!'); } catch { alert('Report generated (demo)'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">Reports & Analytics</div><div className="page-subtitle">Platform insights and performance metrics</div></div>
        <button className="btn-primary" onClick={genReport} disabled={loading}><Download size={14} /> {loading ? 'Generating...' : 'Generate Report'}</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[{ label: 'Revenue Report', sub: 'Monthly financial breakdown', icon: '📄', color: '#dbeafe' },
          { label: 'Occupancy Report', sub: 'Property utilization rates', icon: '📈', color: '#d1fae5' },
          { label: 'Host Performance', sub: 'Top earning hosts', icon: '📋', color: '#fef3c7' }].map(r => (
          <div key={r.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, background: r.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{r.icon}</div>
            <div><div style={{ fontWeight: 700, fontSize: 14 }}>{r.label}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.sub}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Occupancy Rate Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0,100]} />
              <Tooltip formatter={v => [`${v}%`, 'Occupancy']} />
              <Bar dataKey="rate" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Property Type Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontWeight: 700 }}>Top Host Performance</h3>
          <button className="btn-outline btn-sm">View All</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Host Name</th><th>Total Earnings</th><th>Total Bookings</th><th>Avg. per Booking</th><th>Performance</th></tr></thead>
            <tbody>
              {[['Sarah Johnson',3000,156,2500,57],['Michael Chen',8000,243,7000,99],['Emma Wilson',5500,98,5000,40],['David Brown',6000,178,5500,68],['Jennifer Martinez',2000,134,1000,52]].map(([name,earn,book,avg,perf], i) => (
                <tr key={name}>
                  <td><div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>{i+1}</div></td>
                  <td style={{ fontWeight: 600 }}>{name}</td>
                  <td>{earn.toLocaleString()} LKR</td>
                  <td>{book}</td>
                  <td>{avg.toLocaleString()} LKR</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                        <div style={{ width: `${perf}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{perf}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <button className="btn-outline" style={{ justifyContent: 'center', padding: 14 }}><Download size={14} /> Export as PDF</button>
        <button className="btn-outline" style={{ justifyContent: 'center', padding: 14 }}><Download size={14} /> Export as CSV</button>
      </div>
    </DashboardLayout>
  );
}
