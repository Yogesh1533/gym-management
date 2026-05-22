import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { sanitizeObject } from '../../utils/sanitize';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    age: user?.age || '', weight: user?.weight || '',
    height: user?.height || '', fitnessGoal: user?.fitnessGoal || 'general_fitness'
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });
  const setP = (f) => (e) => setPassForm({ ...passForm, [f]: e.target.value });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile(sanitizeObject(form));
      updateUser({ ...user, ...data });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm)
      return toast.error('New passwords do not match');
    setLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>

      <div className="card mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-cyan-500 text-black rounded-full flex items-center justify-center text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-white text-lg">{user?.name}</p>
          <p className="text-zinc-500 text-sm">{user?.email}</p>
          <span className="badge bg-cyan-500/10 text-cyan-400 mt-1 capitalize">{user?.role}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[['profile', 'Profile Info', User], ['password', 'Change Password', Lock]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={set('name')} required /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
            <div><label className="label">Age</label><input type="number" className="input" value={form.age} onChange={set('age')} /></div>
            <div><label className="label">Weight (kg)</label><input type="number" className="input" value={form.weight} onChange={set('weight')} /></div>
            <div><label className="label">Height (cm)</label><input type="number" className="input" value={form.height} onChange={set('height')} /></div>
            <div>
              <label className="label">Fitness Goal</label>
              <select className="input" value={form.fitnessGoal} onChange={set('fitnessGoal')}>
                <option value="general_fitness">General Fitness</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save size={16} />{loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordChange} className="card space-y-4">
          <div><label className="label">Current Password</label><input type="password" className="input" value={passForm.currentPassword} onChange={setP('currentPassword')} required /></div>
          <div><label className="label">New Password</label><input type="password" className="input" value={passForm.newPassword} onChange={setP('newPassword')} required minLength={6} /></div>
          <div><label className="label">Confirm New Password</label><input type="password" className="input" value={passForm.confirm} onChange={setP('confirm')} required /></div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Lock size={16} />{loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
