import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { Download, FileText, TrendingUp, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function PMReports() {
  const [activeTab, setActiveTab] = useState('occupancy');
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.get('/dashboard/payment-manager'),
      api.get('/properties'),
      api.get('/payouts')
    ]).then(([sRes, propRes, payRes]) => {
      if (sRes.status === 'fulfilled') setStats(sRes.value.data);
      if (propRes.status === 'fulfilled') setProperties(propRes.value.data?.properties || propRes.value.data || []);
      if (payRes.status === 'fulfilled') setPayouts(payRes.value.data?.payouts || payRes.value.data || []);
    });
  }, []);

  const monthlyBreakdown = stats?.revenue_stats?.monthly_breakdown || {};
  
  let revenueData = Object.entries(monthlyBreakdown).slice(-6).map(([month, val]) => ({
    month: month.split(' ')[0].substring(0, 3),
    revenue: val
  }));
  if (revenueData.length === 0) revenueData = [{ month: 'N/A', revenue: 0 }];

  let occupancyData = Object.entries(monthlyBreakdown).slice(-6).map(([month, val]) => ({
    month: month.split(' ')[0].substring(0, 3),
    rate: Math.min(100, Math.max(10, (val / 10000) * 100)) // pseudo-occupancy based on revenue
  }));
  if (occupancyData.length === 0) occupancyData = [{ month: 'N/A', rate: 0 }];

  const typeCounts = {};
  properties.forEach(p => {
    const t = p.property_type || 'Other';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const propertyTypeData = Object.entries(typeCounts).map(([name, count], i) => ({
    name,
    value: Math.round((count / Math.max(1, properties.length)) * 100),
    color: ['#1e3a8a', '#10b981', '#f59e0b', '#9ca3af'][i % 4]
  }));
  if (propertyTypeData.length === 0) propertyTypeData.push({ name: 'None', value: 100, color: '#9ca3af' });

  const hostMap = {};
  payouts.forEach(p => {
    const hid = p.host_id;
    if (!hostMap[hid]) {
      hostMap[hid] = { id: hid, name: p.host?.name || `Host #${hid}`, earnings: 0, bookings: 0 };
    }
    hostMap[hid].earnings += Number(p.payout_amount || 0);
    hostMap[hid].bookings += 1;
  });
  
  const topHosts = Object.values(hostMap)
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5)
    .map((h, i) => {
      const avg = h.bookings ? Math.round(h.earnings / h.bookings) : 0;
      const maxEarnings = Math.max(...Object.values(hostMap).map(x => x.earnings)) || 1;
      const perf = Math.round((h.earnings / maxEarnings) * 100);
      return { rank: i + 1, name: h.name, earnings: h.earnings, bookings: h.bookings, avg, perf };
    });

  const exportCSV = () => {
    const csvRows = ['Rank,Host Name,Total Earnings,Total Bookings,Avg Per Booking,Performance'];
    topHosts.forEach(h => {
      csvRows.push(`${h.rank},"${h.name}",${h.earnings},${h.bookings},${h.avg},${h.perf}%`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'host_performance_report.csv';
    a.click();
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">Reports & Analytics</div>
          <div className="page-subtitle">Detailed platform insights and performance metrics</div>
        </div>
        <button className="btn-primary no-print" onClick={exportPDF} style={{ background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          <Download size={14} /> Generate Report
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', border: activeTab === 'revenue' ? '1px solid #1e3a8a' : '1px solid var(--border)', background: activeTab === 'revenue' ? '#eff6ff' : 'white' }} onClick={() => setActiveTab('revenue')}>
          <div style={{ width: 40, height: 40, background: '#dbeafe', color: '#1e3a8a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Revenue Report</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly financial breakdown</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', border: activeTab === 'occupancy' ? '1px solid #10b981' : '1px solid var(--border)', background: activeTab === 'occupancy' ? '#f0fdf4' : 'white' }} onClick={() => setActiveTab('occupancy')}>
          <div style={{ width: 40, height: 40, background: '#d1fae5', color: '#10b981', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Occupancy Report</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Property utilization rates</div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', border: activeTab === 'host' ? '1px solid #f59e0b' : '1px solid var(--border)', background: activeTab === 'host' ? '#fffbeb' : 'white' }} onClick={() => setActiveTab('host')}>
          <div style={{ width: 40, height: 40, background: '#fef3c7', color: '#f59e0b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Host Performance</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Top earning hosts</div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'revenue' && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: 15 }}>Monthly Revenue Breakdown</h3>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={v => `${(v/1000)}k`} />
                <Bar dataKey="revenue" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'occupancy' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
          
          {/* Occupancy Trends */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: 15 }}>Occupancy Rate Trends</h3>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                  <Bar dataKey="rate" fill="#10b981" radius={[2, 2, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Property Type Distribution */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: 15 }}>Property Type Distribution</h3>
            <div style={{ height: 250, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={propertyTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 20;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} fill={propertyTypeData[index].color} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
                        {propertyTypeData[index].name}: {value}%
                      </text>
                    );
                  }} labelLine={false} stroke="none">
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'host' && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Top Host Performance</h3>
            <button style={{ background: 'white', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>View All</button>
          </div>
          
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Rank</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Host Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Earnings</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Bookings</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Avg. per Booking</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Performance</th>
                </tr>
              </thead>
              <tbody>
                {topHosts.length === 0 && <tr><td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No host data</td></tr>}
                {topHosts.map(h => (
                  <tr key={h.rank} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                        {h.rank}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{h.name}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{h.earnings.toLocaleString()} LKR</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{h.bookings}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{h.avg.toLocaleString()} LKR</td>
                    <td style={{ padding: '12px 16px', minWidth: 150 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#10b981', width: `${h.perf}%` }}></div>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.perf}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Reports */}
      <div className="card no-print">
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Export Reports</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <button onClick={exportPDF} style={{ background: 'white', border: '1px solid var(--border)', padding: '16px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <Download size={18} /> Export as PDF
          </button>
          <button onClick={exportCSV} style={{ background: 'white', border: '1px solid var(--border)', padding: '16px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <Download size={18} /> Export as CSV
          </button>
        </div>
      </div>

    </DashboardLayout>
  );
}
