import { useState, useEffect } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../AuthContext';
import { User, Lock, Settings } from 'lucide-react';

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm: '' });
  const [msgProfile, setMsgProfile] = useState('');
  const [msgPwd, setMsgPwd] = useState('');
  const [settings, setSettings] = useState({
    commissionRate: '10',
    minCommission: '5',
    cancellationPolicy: 'Moderate',
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
      setMsg('Platform settings saved successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async e => {
    e.preventDefault(); setMsgProfile('');
    try {
      await api.put('/profile', { name: profile.name, phone: profile.phone });
      updateUser({ name: profile.name, phone: profile.phone });
      setMsgProfile('Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMsgProfile(''), 3000);
    } catch (err) { setMsgProfile(err.response?.data?.message || 'Failed to update profile'); }
  };

  const changePwd = async e => {
    e.preventDefault(); setMsgPwd('');
    if (pwd.new_password !== pwd.confirm) { setMsgPwd('New passwords do not match'); return; }
    try {
      await api.put('/auth/change-password', { current_password: pwd.current_password, new_password: pwd.new_password });
      setMsgPwd('Password changed successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMsgPwd(''), 3000);
      setPwd({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { setMsgPwd(err.response?.data?.message || 'Failed to change password'); }
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">Admin Settings</div>
        <div className="page-subtitle">Configure your profile and platform-wide preferences</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <button 
          style={{ 
            padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'profile' ? 600 : 500
          }}
          onClick={() => setActiveTab('profile')}
        >
          Admin Profile
        </button>
        <button 
          style={{ 
            padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activeTab === 'platform' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'platform' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'platform' ? 600 : 500
          }}
          onClick={() => setActiveTab('platform')}
        >
          Platform Configuration
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 80 }}>
        
        {activeTab === 'profile' && (
          <>
            {/* Profile Info */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Admin Profile</h3>
              {msgProfile && <div className={`alert ${msgProfile.includes('successfully') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msgProfile}</div>}
              <form onSubmit={saveProfile}>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></div>
                <button className="btn-primary" type="submit">Save Profile</button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={18} /> Change Password</h3>
              {msgPwd && <div className={`alert ${msgPwd.includes('successfully') ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>{msgPwd}</div>}
              <form onSubmit={changePwd}>
                <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={pwd.current_password} onChange={e => setPwd({ ...pwd, current_password: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={pwd.new_password} onChange={e => setPwd({ ...pwd, new_password: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Confirm New Password</label><input className="form-input" type="password" value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} required /></div>
                <button className="btn-primary" type="submit">Change Password</button>
              </form>
            </div>
          </>
        )}

        {activeTab === 'platform' && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={22} /> Platform Configuration</h2>
        {msg && <div className="alert alert-success">{msg}</div>}
        
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
        )}
      </div>
    </DashboardLayout>
  );
}
