import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import Modal from '../../components/shared/Modal';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/date';

const EMPTY_SESSION = {
  title: '', description: '', trainer: '', sessionType: 'general',
  date: '', startTime: '', endTime: '', totalSlots: 10, location: 'Main Gym Floor'
};

const typeColors = {
  hiit:     'bg-red-500/10 text-red-400',
  yoga:     'bg-purple-500/10 text-purple-400',
  strength: 'bg-blue-500/10 text-blue-400',
  cardio:   'bg-emerald-500/10 text-emerald-400',
  pilates:  'bg-pink-500/10 text-pink-400',
  crossfit: 'bg-orange-500/10 text-orange-400',
  general:  'bg-zinc-700 text-zinc-300',
};

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_SESSION);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.getSessions().then(res => setSessions(res.data)).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(EMPTY_SESSION); setEditing(null); setModal(true); };
  const openEdit = (s) => {
    setForm({ ...s, date: String(s.date).slice(0, 10) });
    setEditing(s.id); setModal(true);
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await adminAPI.updateSession(editing, form);
        setSessions(prev => prev.map(s => s.id === editing ? data : s));
        toast.success('Session updated!');
      } else {
        const { data } = await adminAPI.createSession(form);
        setSessions(prev => [data, ...prev]);
        toast.success('Session created! Members notified.');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await adminAPI.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      toast.success('Session deleted');
    } catch {
      toast.error('Failed to delete session');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Training Sessions</h1>
          <p className="text-zinc-500 mt-1">{sessions.length} sessions total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map(s => (
          <div key={s.id} className="card hover:border-zinc-600 transition-all">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-white">{s.title}</h3>
              <span className={`badge ${typeColors[s.sessionType]} capitalize text-xs`}>{s.sessionType}</span>
            </div>
            <div className="text-sm text-zinc-500 space-y-1 mb-4">
              <p>👤 {s.trainer}</p>
              <p>📅 {formatDate(s.date)}</p>
              <p>🕐 {s.startTime} – {s.endTime}</p>
              <p>📍 {s.location}</p>
              <p>👥 {s.bookedSlots}/{s.totalSlots} booked</p>
            </div>
            <div className="mb-4">
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className="bg-cyan-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((s.bookedSlots / s.totalSlots) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1 text-sm text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 py-1.5 rounded-lg transition-colors">
                <Edit size={13} /> Edit
              </button>
              <button onClick={() => handleDelete(s.id)} className="flex-1 flex items-center justify-center gap-1 text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 py-1.5 rounded-lg transition-colors">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="col-span-3 text-center py-16 text-zinc-600">
            <Calendar size={48} className="mx-auto mb-3 opacity-30" />
            <p>No sessions yet. Create one!</p>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Session' : 'Create Session'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Title *</label><input className="input" value={form.title} onChange={set('title')} required /></div>
            <div className="col-span-2"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={set('description')} /></div>
            <div><label className="label">Trainer *</label><input className="input" value={form.trainer} onChange={set('trainer')} required /></div>
            <div>
              <label className="label">Session Type</label>
              <select className="input" value={form.sessionType} onChange={set('sessionType')}>
                {['general','hiit','yoga','strength','cardio','pilates','crossfit'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={set('date')} required /></div>
            <div><label className="label">Total Slots</label><input type="number" className="input" value={form.totalSlots} onChange={set('totalSlots')} min={1} /></div>
            <div><label className="label">Start Time *</label><input type="time" className="input" value={form.startTime} onChange={set('startTime')} required /></div>
            <div><label className="label">End Time *</label><input type="time" className="input" value={form.endTime} onChange={set('endTime')} required /></div>
            <div className="col-span-2"><label className="label">Location</label><input className="input" value={form.location} onChange={set('location')} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Session' : 'Create Session'}</button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
