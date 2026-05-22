import React, { useEffect, useState } from 'react';
import { membershipAPI, adminAPI } from '../../services/api';
import Modal from '../../components/shared/Modal';
import { Plus, Edit, Trash2, CreditCard, Check, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '', tier: 'basic', price: 29, billingCycle: 'monthly',
  sessionLimit: 2, features: [], color: '#06b6d4', isActive: true
};

const tierColors = {
  basic:    'bg-zinc-500/10 text-zinc-400',
  standard: 'bg-cyan-500/10 text-cyan-400',
  premium:  'bg-purple-500/10 text-purple-400',
  annual:   'bg-yellow-500/10 text-yellow-400',
};

export default function AdminMemberships() {
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assignForm, setAssignForm] = useState({ memberId: '', planId: '' });

  useEffect(() => {
    Promise.all([membershipAPI.getAllPlans(), adminAPI.getMembers()])
      .then(([p, m]) => { setPlans(p.data); setMembers(m.data); })
      .finally(() => setLoading(false));
  }, []);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (p) => { setForm({ ...p, features: p.features || [] }); setEditing(p.id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), sessionLimit: parseInt(form.sessionLimit) };
      if (editing) {
        const { data } = await membershipAPI.updatePlan(editing, payload);
        setPlans(prev => prev.map(p => p.id === editing ? data : p));
        toast.success('Plan updated!');
      } else {
        const { data } = await membershipAPI.createPlan(payload);
        setPlans(prev => [...prev, data]);
        toast.success('Plan created!');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await membershipAPI.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plan deleted');
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await membershipAPI.assignPlan(assignForm.memberId, assignForm.planId);
      toast.success('Membership assigned!');
      setAssignModal(false);
      const { data } = await adminAPI.getMembers();
      setMembers(data);
    } catch (err) {
      toast.error('Failed to assign');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Membership Plans</h1>
          <p className="text-zinc-500 mt-1">{plans.length} plans · {members.length} members</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setAssignModal(true)} className="btn-secondary flex items-center gap-2">
            <Users size={16} /> Assign Plan
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Plan
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {plans.map(plan => (
          <div key={plan.id} className="card border hover:border-zinc-600 transition-all" style={{ borderColor: plan.color + '40' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`badge ${tierColors[plan.tier]} capitalize text-xs mb-2 block w-fit`}>{plan.tier}</span>
                <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-2xl font-extrabold text-white">${plan.price}</span>
                  <span className="text-zinc-500 text-xs mb-1">/{plan.billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {plan.sessionLimit === -1 ? 'Unlimited sessions' : `${plan.sessionLimit} sessions/month`}
                </p>
              </div>
              <div className="w-4 h-4 rounded-full mt-1" style={{ backgroundColor: plan.color }} />
            </div>
            <ul className="space-y-1 mb-4">
              {plan.features?.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-400">
                  <Check size={12} className="mt-0.5 flex-shrink-0 text-emerald-400" />{f}
                </li>
              ))}
              {plan.features?.length > 4 && <li className="text-xs text-zinc-600">+{plan.features.length - 4} more</li>}
            </ul>
            <div className="flex gap-2">
              <button onClick={() => openEdit(plan)} className="flex-1 text-xs text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Edit size={12} /> Edit
              </button>
              <button onClick={() => handleDelete(plan.id)} className="flex-1 text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Members with their plans */}
      <div className="card">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Users size={18} className="text-cyan-400" /> Member Memberships</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800 border-b border-zinc-700">
              <tr>
                {['Member', 'Email', 'Current Plan', 'Tier', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-zinc-800 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{m.email}</td>
                  <td className="px-4 py-3 text-zinc-300">{m.membershipPlan?.name || <span className="text-zinc-600">No plan</span>}</td>
                  <td className="px-4 py-3">
                    {m.membershipPlan ? (
                      <span className={`badge ${tierColors[m.membershipPlan.tier]} capitalize text-xs`}>{m.membershipPlan.tier}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setAssignForm({ memberId: m.id, planId: m.membershipPlanId || '' }); setAssignModal(true); }}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Change Plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Plan' : 'Create Plan'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Plan Name *</label><input className="input" value={form.name} onChange={set('name')} required /></div>
            <div>
              <label className="label">Tier</label>
              <select className="input" value={form.tier} onChange={set('tier')}>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="label">Billing Cycle</label>
              <select className="input" value={form.billingCycle} onChange={set('billingCycle')}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div><label className="label">Price ($)</label><input type="number" className="input" value={form.price} onChange={set('price')} min={0} step={0.01} /></div>
            <div>
              <label className="label">Session Limit (-1 = unlimited)</label>
              <input type="number" className="input" value={form.sessionLimit} onChange={set('sessionLimit')} min={-1} />
            </div>
            <div><label className="label">Color (hex)</label><input type="color" className="input h-10 p-1 cursor-pointer" value={form.color} onChange={set('color')} /></div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <label htmlFor="isActive" className="text-sm text-zinc-400">Active (visible to public)</label>
            </div>
          </div>
          <div>
            <label className="label">Features (one per line)</label>
            <textarea
              className="input" rows={5}
              value={Array.isArray(form.features) ? form.features.join('\n') : ''}
              onChange={e => setForm({ ...form, features: e.target.value.split('\n').filter(Boolean) })}
              placeholder="Unlimited session bookings&#10;AI plan generation&#10;Progress tracking"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Membership Plan">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="label">Member</label>
            <select className="input" value={assignForm.memberId} onChange={e => setAssignForm({ ...assignForm, memberId: e.target.value })} required>
              <option value="">— Select Member —</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Membership Plan</label>
            <select className="input" value={assignForm.planId} onChange={e => setAssignForm({ ...assignForm, planId: e.target.value })} required>
              <option value="">— Select Plan —</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}/{p.billingCycle === 'yearly' ? 'yr' : 'mo'}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Assigning...' : 'Assign Plan'}</button>
            <button type="button" onClick={() => setAssignModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
