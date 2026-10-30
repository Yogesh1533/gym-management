import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import Modal from '../../components/shared/Modal';
import { Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editMember, setEditMember] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([adminAPI.getMembers(), adminAPI.getWorkoutPlans(), adminAPI.getDietPlans()])
      .then(([m, w, d]) => { setMembers(m.data); setWorkoutPlans(w.data); setDietPlans(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await adminAPI.updateMember(editMember.id, editMember);
      setMembers(prev => prev.map(m => m.id === data.id ? data : m));
      setEditMember(null);
      toast.success('Member updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member permanently?')) return;
    try {
      await adminAPI.deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
      toast.success('Member deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="text-zinc-500 mt-1">{members.length} total members</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input className="input pl-9" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] border-b border-white/10">
              <tr>
                {['Member', 'Contact', 'Goal', 'Plans', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-500 text-black rounded-full flex items-center justify-center font-bold text-sm">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{m.name}</p>
                        <p className="text-xs text-zinc-500">{m.age ? `${m.age} yrs` : '—'} {m.weight ? `· ${m.weight}kg` : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    <p>{m.email}</p>
                    <p className="text-xs">{m.phone || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-blue-100 text-blue-700 capitalize text-xs">
                      {m.fitnessGoal?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    <p>💪 {m.workoutPlan?.title || <span className="text-red-400">None</span>}</p>
                    <p>🥗 {m.dietPlan?.title || <span className="text-red-400">None</span>}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {m.isActive ? <><UserCheck size={11} className="inline mr-1" />Active</> : <><UserX size={11} className="inline mr-1" />Inactive</>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditMember({ ...m, workoutPlan: m.workoutPlan?.id || '', dietPlan: m.dietPlan?.id || '' })}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-zinc-500 py-8">No members found.</p>}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editMember} onClose={() => setEditMember(null)} title="Edit Member" size="lg">
        {editMember && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Name</label><input className="input" value={editMember.name} onChange={e => setEditMember({ ...editMember, name: e.target.value })} /></div>
              <div><label className="label">Email</label><input className="input" value={editMember.email} onChange={e => setEditMember({ ...editMember, email: e.target.value })} /></div>
              <div><label className="label">Phone</label><input className="input" value={editMember.phone || ''} onChange={e => setEditMember({ ...editMember, phone: e.target.value })} /></div>
              <div><label className="label">Age</label><input type="number" className="input" value={editMember.age || ''} onChange={e => setEditMember({ ...editMember, age: e.target.value })} /></div>
              <div><label className="label">Weight (kg)</label><input type="number" className="input" value={editMember.weight || ''} onChange={e => setEditMember({ ...editMember, weight: e.target.value })} /></div>
              <div><label className="label">Height (cm)</label><input type="number" className="input" value={editMember.height || ''} onChange={e => setEditMember({ ...editMember, height: e.target.value })} /></div>
              <div>
                <label className="label">Assign Workout Plan</label>
                <select className="input" value={editMember.workoutPlan || ''} onChange={e => setEditMember({ ...editMember, workoutPlan: e.target.value })}>
                  <option value="">— None —</option>
                  {workoutPlans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Assign Diet Plan</label>
                <select className="input" value={editMember.dietPlan || ''} onChange={e => setEditMember({ ...editMember, dietPlan: e.target.value })}>
                  <option value="">— None —</option>
                  {dietPlans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={editMember.isActive} onChange={e => setEditMember({ ...editMember, isActive: e.target.checked })} className="rounded" />
              <label htmlFor="isActive" className="text-sm text-zinc-400">Account Active</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" onClick={() => setEditMember(null)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
