import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { useAuth } from '../../AuthContext';

export default function GuestSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', address: '' });
  const [pwd, setPwd] = useState({ old_password: '', new_password: '' });
  const [msg1, setMsg1] = useState(''); const [msg2, setMsg2] = useState('');

  const saveProfile = async e => {
    e.preventDefault(); setMsg1('');
    try { await api.put('/auth/update-profile', profile); setMsg1('Profile updated!'); } catch (err) { setMsg1(err.response?.data?.message || 'Failed'); }
  };
  const changePwd = async e => {
    e.preventDefault(); setMsg2('');
    try { await api.put('/auth/change-password', pwd); setMsg2('Password changed!'); setPwd({ old_password: '', new_password: '' }); } catch (err) { setMsg2(err.response?.data?.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Settings</div><div className="page-subtitle">Manage your account</div></div>
      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Profile Information</h3>
          {msg1 && <div className={`alert ${msg1.includes('updated') ? 'alert-success' : 'alert-error'}`}>{msg1}</div>}
          <form onSubmit={saveProfile}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} /></div>
            <button className="btn-primary" type="submit">Save Changes</button>
          </form>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Change Password</h3>
          {msg2 && <div className={`alert ${msg2.includes('changed') ? 'alert-success' : 'alert-error'}`}>{msg2}</div>}
          <form onSubmit={changePwd}>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={pwd.old_password} onChange={e => setPwd({ ...pwd, old_password: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={pwd.new_password} onChange={e => setPwd({ ...pwd, new_password: e.target.value })} /></div>
            <button className="btn-primary" type="submit">Change Password</button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
