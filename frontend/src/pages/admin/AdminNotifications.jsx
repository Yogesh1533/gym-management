import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Send, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ recipientId: 'all', title: '', message: '', type: 'general' });
  const [sending, setSending] = useState(false);

  useEffect(() => { adminAPI.getMembers().then(res => setMembers(res.data)); }, []);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await adminAPI.sendNotification(form);
      toast.success(data.message);
      setForm({ recipientId: 'all', title: '', message: '', type: 'general' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally { setSending(false); }
  };

  const templates = [
    { label: 'New Session Alert', title: 'New Session Available!', message: 'A new training session has been added. Check the sessions page and book your spot!', type: 'new_session' },
    { label: 'Gym Closure', title: 'Gym Closure Notice', message: 'The gym will be closed this Sunday for maintenance. We apologize for the inconvenience.', type: 'general' },
    { label: 'Promotion', title: '🎉 Special Offer!', message: 'Refer a friend this month and get one month free membership!', type: 'general' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Send Notifications</h1>
        <p className="text-zinc-500 mt-1">Send in-app notifications to members.</p>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold text-white mb-3 flex items-center gap-2"><Bell size={16} className="text-cyan-400" /> Quick Templates</h2>
        <div className="flex flex-wrap gap-2">
          {templates.map(t => (
            <button key={t.label} onClick={() => setForm({ ...form, title: t.title, message: t.message, type: t.type })}
              className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 transition-colors">
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSend} className="card space-y-4">
        <div>
          <label className="label">Send To</label>
          <select className="input" value={form.recipientId} onChange={set('recipientId')}>
            <option value="all">📢 All Members ({members.length})</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Notification Type</label>
          <select className="input" value={form.type} onChange={set('type')}>
            <option value="general">General</option>
            <option value="new_session">New Session</option>
            <option value="booking_confirmed">Booking Confirmed</option>
            <option value="plan_assigned">Plan Assigned</option>
          </select>
        </div>
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="Notification title..." value={form.title} onChange={set('title')} required />
        </div>
        <div>
          <label className="label">Message *</label>
          <textarea className="input" rows={4} placeholder="Write your message here..." value={form.message} onChange={set('message')} required />
        </div>
        <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2">
          <Send size={16} />{sending ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
}
