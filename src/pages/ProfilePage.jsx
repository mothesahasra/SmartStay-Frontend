import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '', avatarUrl: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '', avatarUrl: user.avatarUrl || '' });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.updateProfile(profile);
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Password change failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container page-wrapper">
      <h1 className="mb-lg">My Profile</h1>
      <div className="tabs">
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
        <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Security</button>
      </div>

      {tab === 'profile' && (
        <div className="card form-card animate-slideUp" style={{ maxWidth: 560 }}>
          <form onSubmit={handleUpdateProfile}>
            <div className="flex items-center gap-lg mb-lg">
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700,
              }}>
                {(user?.firstName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-muted">{user?.email} · <span className="badge badge-primary">{user?.role}</span></p>
              </div>
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} id="profile-fname" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} id="profile-lname" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} id="profile-phone" />
            </div>
            <div className="form-group">
              <label className="form-label">Avatar URL</label>
              <input placeholder="https://..." value={profile.avatarUrl} onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })} id="profile-avatar" />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="profile-save">
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }}></span> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card form-card animate-slideUp" style={{ maxWidth: 480 }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required id="pw-current" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} id="pw-new" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required id="pw-confirm" />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading} id="pw-save">
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }}></span> : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
