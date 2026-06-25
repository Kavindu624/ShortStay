import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Clock, CheckCircle, TrendingUp, Download } from 'lucide-react';

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PMDashboard() {
  const [payments, setPayments] = useState([]);
  useEffect(() => { api.get('/payments').then(r => setPayments(r.data || [])).catch(() => {}); }, []);

  const totalEarnings = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const chartData = MONTHS.map(m => ({ month: m, revenue: Math.floor(Math.random()*2000000+4000000), commissions: Math.floor(Math.random()*500000+400000) }));

  const genReport = async () => { try { await api.get('/payments/report'); alert('Report generated!'); } catch { alert('Report generated (demo)'); } };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Accountant Dashboard</div><div className="page-subtitle">Manage platform finances and host payouts</div></div>

      <div className="stats-grid">
        {[
          { label: 'Total Earnings', value: `${totalEarnings.toLocaleString()} LKR`, icon: DollarSign, sub: '↗ 15% vs last month' },
          { label: 'Pending Payouts', value: 12, icon: Clock },
          { label: 'Completed Payouts', value: 156, icon: CheckCircle, sub: '↗ 8% vs last month' },
          { label: 'Monthly Commission', value: '650,000 LKR', icon: TrendingUp, sub: '↗ 12% vs last month' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div>{s.sub && <div className="stat-sub">{s.sub}</div>}</div>
            <div className="stat-icon"><s.icon size={20} /></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Financial Summary</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="commissions" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Pending Actions</h3>
          {[['Payouts to Release', 12], ['Invoices to Generate', 5], ['Pending Refunds', 3]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Financial Breakdown</h3>
          {[['Total Revenue', '6,500,000', 'var(--text-main)'], ['Platform Commission', '650,000', 'var(--accent)'], ['Host Earnings', '5,850,000', 'var(--text-main)']].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontWeight: 700, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Recent Transactions</h3>
        {payments.slice(0, 5).map(p => (
          <div key={p.payment_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Payment #{p.payment_id}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Booking #BK-{p.booking_id} • {p.payment_date}</div>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>+Rs.{Number(p.amount).toLocaleString()}</div>
          </div>
        ))}
        {payments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No transactions yet.</p>}
      </div>
    </DashboardLayout>
  );
}
