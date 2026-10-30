import React, { useEffect, useState } from 'react';
import { Mail, Phone, Trash2, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import PageLoader from '../../components/shared/PageLoader';

const STATUSES = ['new', 'contacted', 'converted', 'closed'];
const statusStyle = {
  new: 'text-brand-200 bg-brand-400/15 ring-brand-400/30',
  contacted: 'text-sky-300 bg-sky-400/10 ring-sky-400/20',
  converted: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/20',
  closed: 'text-zinc-400 bg-white/5 ring-white/10',
};
const goals = { weight_loss: 'Lose weight', muscle_gain: 'Build muscle', endurance: 'Endurance', general_fitness: 'General fitness' };

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getLeads().then(r => setLeads(r.data)).finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    try {
      const { data } = await adminAPI.updateLead(id, status);
      setLeads(prev => prev.map(l => (l.id === id ? data : l)));
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Could not update lead'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await adminAPI.deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch { toast.error('Could not delete lead'); }
  };

  if (loading) return <PageLoader />;
  const shown = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const count = (s) => leads.filter(l => l.status === s).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="eyebrow">Growth</p>
      <h1 className="page-title mt-2">Free-trial leads</h1>
      <p className="text-zinc-500 mt-1">Requests from the website's free-trial form. Follow up within 24 hours.</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-brand-400 text-ink-950' : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10'}`}>
            {s} <span className="opacity-60 tabular-nums">{s === 'all' ? leads.length : count(s)}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center py-16 text-center">
          <Inbox size={32} className="text-zinc-600" />
          <p className="mt-3 text-zinc-400">No leads here yet.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {shown.map(l => (
            <li key={l.id} className="card p-5 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{l.name}</p>
                  <span className={`badge ring-1 capitalize ${statusStyle[l.status]}`}>{l.status}</span>
                  {l.goal && <span className="text-xs text-zinc-500">· {goals[l.goal] || l.goal}</span>}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
                  <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 hover:text-brand-300"><Mail size={14} />{l.email}</a>
                  {l.phone && <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 hover:text-brand-300"><Phone size={14} />{l.phone}</a>}
                  <span className="text-zinc-600">{new Date(l.createdAt).toLocaleString()}</span>
                </div>
                {l.message && <p className="mt-2 text-sm text-zinc-300">“{l.message}”</p>}
              </div>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`lead-${l.id}`}>Status</label>
                <select id={`lead-${l.id}`} className="input w-36 py-2" value={l.status} onChange={e => setStatus(l.id, e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <button onClick={() => remove(l.id)} className="btn-ghost p-2 hover:text-rose-400" aria-label={`Delete lead from ${l.name}`}><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
