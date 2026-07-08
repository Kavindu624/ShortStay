import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api';
import { useAuth } from '../../AuthContext';
import { getProfileUrl } from '../../utils';
import { User, Lock, Trash2, Camera, Bell, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function GuestSettings() {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', bank_details: user?.bank_details || '' });
  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm: '' });
  const [msg1, setMsg1] = useState(''); 
  const [msg2, setMsg2] = useState('');
  const [msg3, setMsg3] = useState('');
  const [msg4, setMsg4] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ email_system: true, email_booking: true, email_payment: true });
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(user?.profile_picture || null);
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteModal, setDeleteModal] = useState(false);
  const fileRef = useRef();

  // Fetch real profile from backend on mount to get up-to-date profile_picture
  useEffect(() => {
    api.get('/profile').then(r => {
      const pic = r.data?.profile_picture || null;
      setAvatar(pic);
      if (pic) updateUser({ profile_picture: pic });
      // Pre-fill profile fields from backend
      setProfile(prev => ({
        ...prev,
        name: r.data?.name || prev.name,
        phone: r.data?.phone || prev.phone,
        address: r.data?.address || prev.address,
        bank_details: r.data?.bank_details || prev.bank_details,
      }));
    }).catch(() => {});

    api.get('/notifications/preferences')
      .then(r => setNotifPrefs(r.data.preferences || { email_system: true, email_booking: true, email_payment: true }))
      .catch(() => {});
  }, []);

  const saveProfile = async e => {
    e.preventDefault(); setMsg1('');
    try {
      await api.put('/profile', { name: profile.name, phone: profile.phone });
      
      // Update role-specific data using the correct endpoints
      if (user?.role === 'guest') {
        await api.put('/profile/address', { address: profile.address });
      } else if (user?.role === 'host') {
        await api.put('/profile/bank-details', { bank_details: profile.bank_details });
      }

      // Update global context so TopBar and other components reflect changes immediately
      updateUser({ 
        name: profile.name, 
        phone: profile.phone, 
        ...(user?.role === 'guest' ? { address: profile.address } : {}),
        ...(user?.role === 'host' ? { bank_details: profile.bank_details } : {})
      });

      setMsg1('Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { setMsg1(err.response?.data?.message || 'Failed to update profile'); }
  };

  const changePwd = async e => {
    e.preventDefault(); setMsg2('');
    if (pwd.new_password !== pwd.confirm) { setMsg2('New passwords do not match'); return; }
    try {
      await api.put('/auth/change-password', { old_password: pwd.current_password, new_password: pwd.new_password });
      setMsg2('Password changed successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setPwd({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { setMsg2(err.response?.data?.message || 'Failed to change password'); }
  };

  const saveNotifPrefs = async e => {
    e.preventDefault(); setMsg4('');
    try {
      await api.put('/notifications/preferences', notifPrefs);
      setMsg4('Preferences updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setMsg4(''), 3000);
    } catch (err) { setMsg4('Failed to update preferences'); }
  };

  const uploadAvatar = async e => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate type client-side
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setMsg1('Only JPG or PNG images allowed'); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMsg1('Image must be under 2MB'); return;
    }
    const fd = new FormData();
    fd.append('profile_picture', file);
    setUploading(true); setMsg1('');
    try {
      // Backend route is POST /api/profile/picture (not PUT)
      const res = await api.post('/profile/picture', fd);
      // Response returns full URL: { profile_picture: 'http://localhost:5000/uploads/...' }
      const newPic = res.data?.profile_picture || null;
      setAvatar(newPic);
      // Persist the new picture into AuthContext + localStorage so TopBar and other
      // components pick it up immediately and it survives page navigation
      if (newPic) updateUser({ profile_picture: newPic });
      setMsg1('✓ Profile picture updated successfully!');
    } catch (err) { setMsg1(err.response?.data?.message || 'Failed to upload picture'); }
    finally { setUploading(false); }
  };

  const confirmDeleteAccount = async () => {
    try {
      // Backend route is DELETE /api/profile/account
      await api.delete('/profile/account');
      logout();
    } catch (err) { 
      setMsg3(err.response?.data?.message || 'Failed to delete account'); 
      setDeleteModal(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header"><div className="page-title">Settings</div><div className="page-subtitle">Manage your account information and preferences</div></div>
      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Profile Picture */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Profile Picture</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              {avatar ? (
                // avatar is a full URL returned from backend after upload
                <img src={avatar.startsWith('http') ? avatar : getProfileUrl(avatar)}
                  alt="avatar"
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', fontWeight: 700 }}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{user?.email}</div>
              <button className="btn-outline btn-sm" onClick={() => fileRef.current.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Camera size={13} /> {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Profile Information</h3>
          {msg1 && <div className={`alert ${msg1.includes('successfully') || msg1.includes('updated') ? 'alert-success' : 'alert-error'}`}>{msg1}</div>}
          <form onSubmit={saveProfile}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" type="tel" placeholder="+94 77 123 4567" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></div>
            
            {user?.role === 'guest' && (
              <div className="form-group"><label className="form-label">Address</label><input className="form-input" placeholder="Your full address" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} /></div>
            )}
            
            {user?.role === 'host' && (
              <div className="form-group"><label className="form-label">Bank Details</label><input className="form-input" placeholder="Bank Name, Account Number, Branch" value={profile.bank_details} onChange={e => setProfile({ ...profile, bank_details: e.target.value })} /></div>
            )}

            <button className="btn-primary" type="submit">Save Changes</button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={18} /> Change Password</h3>
          {msg2 && <div className={`alert ${msg2.includes('successfully') ? 'alert-success' : 'alert-error'}`}>{msg2}</div>}
          <form onSubmit={changePwd}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPwd ? "text" : "password"} value={pwd.current_password} onChange={e => setPwd({ ...pwd, current_password: e.target.value })} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPwd ? "text" : "password"} value={pwd.new_password} onChange={e => setPwd({ ...pwd, new_password: e.target.value })} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPwd ? "text" : "password"} value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="btn-primary" type="submit">Change Password</button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={18} /> Notification Preferences</h3>
          {msg4 && <div className={`alert ${msg4.includes('successfully') ? 'alert-success' : 'alert-error'}`}>{msg4}</div>}
          <form onSubmit={saveNotifPrefs}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Email Notifications</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Receive general updates via email</div>
              </div>
              <input type="checkbox" checked={notifPrefs.email_system} onChange={e => setNotifPrefs({...notifPrefs, email_system: e.target.checked})} style={{ width: 16, height: 16 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Booking Updates</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Get notified when your booking status changes</div>
              </div>
              <input type="checkbox" checked={notifPrefs.email_booking} onChange={e => setNotifPrefs({...notifPrefs, email_booking: e.target.checked})} style={{ width: 16, height: 16 }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Payment Updates</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Get notified about successful or failed payments</div>
              </div>
              <input type="checkbox" checked={notifPrefs.email_payment} onChange={e => setNotifPrefs({...notifPrefs, email_payment: e.target.checked})} style={{ width: 16, height: 16 }} />
            </div>
            <button className="btn-primary" type="submit">Save Preferences</button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ border: '1.5px solid #fee2e2' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}><Trash2 size={18} /> Danger Zone</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          {msg3 && <div className="alert alert-error">{msg3}</div>}
          <button className="btn-danger" onClick={() => setDeleteModal(true)}>Delete My Account</button>
        </div>
        </div>
        
        {/* Delete Account Modal */}
        {deleteModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: 400, maxWidth: '90%', textAlign: 'center', padding: '32px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111827' }}>Delete Account?</h2>
              <p style={{ color: '#4b5563', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
                Are you sure you want to <strong>permanently</strong> delete your account? This will erase all your data and cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" onClick={confirmDeleteAccount} style={{ flex: 1, background: '#ef4444', justifyContent: 'center' }}>
                  Yes, Delete
                </button>
                <button className="btn-outline" onClick={() => setDeleteModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
