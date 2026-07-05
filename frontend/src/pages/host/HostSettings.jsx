import { useState, useEffect } from 'react';
import api from '../../api';

export default function HostSettings() {
  const [settings, setSettings] = useState({
    commissionRate: '10',
    minCommission: '5',
    enableTax: false,
    taxRate: '8.5',
    taxId: 'XX-XXXXXXX',
    cancellationPolicy: '',
    minBookingDays: '1',
    maxAdvanceBooking: '365',
    notifNewBooking: true,
    notifPayment: true,
    notifVerification: false,
    notifWeekly: false,
    supportEmail: 'support@shortstay.com',
    notifEmail: 'notifications@shortstay.com'
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data && Object.keys(res.data).length > 0) {
        setSettings(prev => ({
          ...prev,
          ...res.data,
          enableTax: res.data.enableTax === 'true',
          notifNewBooking: res.data.notifNewBooking === 'true',
          notifPayment: res.data.notifPayment === 'true',
          notifVerification: res.data.notifVerification === 'true',
          notifWeekly: res.data.notifWeekly === 'true',
        }));
      }
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      setMsg('Settings saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">Platform Settings</div>
        <div className="page-subtitle">Configure platform-wide settings and preferences</div>
      </div>

      {msg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{msg}</div>}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 80 }}>
        
        {/* Commission Configuration */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Commission Configuration</h3>
          
          <div className="form-group">
            <label className="form-label">Platform Commission Rate (%)</label>
            <input type="number" name="commissionRate" className="form-input" value={settings.commissionRate} onChange={handleChange} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Current rate: 10% per booking</div>
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Minimum Commission Amount ($)</label>
            <input type="number" name="minCommission" className="form-input" value={settings.minCommission} onChange={handleChange} />
          </div>
        </div>

        {/* Tax Configuration */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Tax Configuration</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <input type="checkbox" name="enableTax" id="enableTax" checked={settings.enableTax} onChange={handleChange} style={{ width: 16, height: 16 }} />
            <label htmlFor="enableTax" style={{ fontSize: 14, fontWeight: 500 }}>Enable Tax Collection</label>
          </div>
          
          <div className="form-group">
            <label className="form-label">Default Tax Rate (%)</label>
            <input type="number" step="0.1" name="taxRate" className="form-input" value={settings.taxRate} onChange={handleChange} />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tax ID Number</label>
            <input type="text" name="taxId" className="form-input" value={settings.taxId} onChange={handleChange} />
          </div>
        </div>

        {/* Platform Rules */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Platform Rules</h3>
          
          <div className="form-group">
            <label className="form-label">Cancellation Policy</label>
            <input type="text" name="cancellationPolicy" className="form-input" value={settings.cancellationPolicy} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Minimum Booking Days</label>
            <input type="number" name="minBookingDays" className="form-input" value={settings.minBookingDays} onChange={handleChange} />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Maximum Advance Booking (days)</label>
            <input type="number" name="maxAdvanceBooking" className="form-input" value={settings.maxAdvanceBooking} onChange={handleChange} />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Notification Preferences</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>New Booking Notifications</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Notify admins when new bookings are made</div>
            </div>
            <input type="checkbox" name="notifNewBooking" checked={settings.notifNewBooking} onChange={handleChange} style={{ width: 16, height: 16 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Payment Notifications</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Notify when payments are processed</div>
            </div>
            <input type="checkbox" name="notifPayment" checked={settings.notifPayment} onChange={handleChange} style={{ width: 16, height: 16 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Verification Pending Alerts</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Alert when properties need verification</div>
            </div>
            <input type="checkbox" name="notifVerification" checked={settings.notifVerification} onChange={handleChange} style={{ width: 16, height: 16 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Weekly Summary Reports</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Receive weekly platform performance reports</div>
            </div>
            <input type="checkbox" name="notifWeekly" checked={settings.notifWeekly} onChange={handleChange} style={{ width: 16, height: 16 }} />
          </div>
        </div>

        {/* Email Settings */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Email Settings</h3>
          
          <div className="form-group">
            <label className="form-label">Support Email</label>
            <input type="email" name="supportEmail" className="form-input" value={settings.supportEmail} onChange={handleChange} />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Notification Email</label>
            <input type="email" name="notifEmail" className="form-input" value={settings.notifEmail} onChange={handleChange} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
          <button type="button" className="btn-outline" style={{ padding: '10px 24px', fontWeight: 600, border: '1.5px solid var(--border)' }}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '10px 24px', fontWeight: 600 }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
