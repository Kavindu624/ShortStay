import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#1e3a8a','#10b981','#f59e0b','#6b7280'];

export default function PMReports() {
  const [loading, setLoading] = useState(false);
  const data = MONTHS.map(m => ({ month: m, rate: Math.floor(Math.random()*20+70) }));
  const pie = [{ name: 'Apartment', value: 45 },{ name: 'House', value: 30 },{ name: 'Villa', value: 15 },{ name: 'Other', value: 10 }];

  const genReport = async () => {
    setLoading(true);
    try { await api.get('/payments/report'); alert('Report generated!'); } catch { alert('Report generated (demo)'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><div className="page-title">Reports & Analytics</div><div className="page-subtitle">Detailed platform insights and performance metrics</div></div>
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
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card"><h3 style={{ fontWeight: 700, marginBottom: 16 }}>Occupancy Rate Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /><Tooltip formatter={v => [`${v}%`, 'Occupancy']} /><Bar dataKey="rate" fill="#10b981" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card"><h3 style={{ fontWeight: 700, marginBottom: 16 }}>Property Type Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={pie} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>{pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid-2">
        <button className="btn-outline" style={{ justifyContent: 'center', padding: 14 }}><Download size={14} /> Export as PDF</button>
        <button className="btn-outline" style={{ justifyContent: 'center', padding: 14 }}><Download size={14} /> Export as CSV</button>
      </div>
    </DashboardLayout>
  );
}
