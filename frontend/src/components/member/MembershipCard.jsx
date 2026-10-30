import React, { useEffect, useState } from 'react';
import { membershipAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { CreditCard, Check, Zap } from 'lucide-react';

export default function MembershipCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membershipAPI.getMyMembership()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const { plan, sessionsUsed, sessionsRemaining } = data;

  if (!plan) return (
    <div className="card border border-dashed border-white/10 text-center py-8">
      <CreditCard size={32} className="mx-auto mb-3 text-zinc-600" />
      <p className="text-zinc-500 text-sm mb-3">No membership plan assigned yet.</p>
      <Link to="/pricing" className="btn-primary text-sm px-4 py-2">View Plans</Link>
    </div>
  );

  const usagePercent = plan.sessionLimit === -1 ? 100 : Math.min((sessionsUsed / plan.sessionLimit) * 100, 100);

  return (
    <div className="card border" style={{ borderColor: plan.color + '40' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} style={{ color: plan.color }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: plan.color }}>{plan.tier} plan</span>
          </div>
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <p className="text-zinc-500 text-sm">${plan.price}/{plan.billingCycle === 'yearly' ? 'year' : 'month'}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: plan.color + '20' }}>
          <Zap size={18} style={{ color: plan.color }} />
        </div>
      </div>

      {/* Session Usage */}
      {plan.sessionLimit !== -1 ? (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Sessions this month</span>
            <span>{sessionsUsed} / {plan.sessionLimit}</span>
          </div>
          <div className="w-full bg-white/[0.04] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${usagePercent}%`, backgroundColor: usagePercent >= 100 ? '#ef4444' : plan.color }}
            />
          </div>
          {sessionsRemaining === 0 && (
            <p className="text-xs text-red-400 mt-1">Session limit reached. <Link to="/pricing" className="underline">Upgrade</Link> for unlimited.</p>
          )}
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2 text-xs text-emerald-400">
          <Check size={14} /> Unlimited sessions
        </div>
      )}

      {/* Features */}
      <ul className="space-y-1 mb-4">
        {plan.features?.slice(0, 4).map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
            <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: plan.color }} />{f}
          </li>
        ))}
      </ul>

      <Link to="/pricing" className="text-xs hover:underline" style={{ color: plan.color }}>
        View all plans →
      </Link>
    </div>
  );
}
