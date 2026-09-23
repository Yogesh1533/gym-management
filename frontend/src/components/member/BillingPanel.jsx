import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { membershipAPI } from '../../services/api';
import { formatDate } from '../../utils/date';
import PageLoader from '../shared/PageLoader';

export default function BillingPanel() {
  const [membership, setMembership] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = () => Promise.all([membershipAPI.getMyMembership(), membershipAPI.getPayments()])
    .then(([m, p]) => { setMembership(m.data); setPayments(p.data); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const cancel = async () => {
    if (!window.confirm('Cancel your membership? You can re-join any time.')) return;
    setCancelling(true);
    try {
      await membershipAPI.cancel();
      toast.success('Membership cancelled');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageLoader full={false} />;
  const plan = membership?.plan;

  return (
    <div className="space-y-6">
      <div className="card relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-400/10 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Current membership</p>
            {plan ? (
              <>
                <p className="mt-2 font-display text-2xl font-semibold text-white">{plan.name}</p>
                <p className="text-sm text-zinc-400">
                  ${plan.price}/{plan.billingCycle === 'yearly' ? 'year' : 'month'}
                  {membership.renewsAt && <> · renews {formatDate(membership.renewsAt)}</>}
                </p>
                {membership.sessionsRemaining !== null && (
                  <p className="mt-2 text-sm text-amber-300">{membership.sessionsRemaining} of {plan.sessionLimit} class bookings left this month</p>
                )}
              </>
            ) : (
              <p className="mt-2 text-zinc-400">You don't have an active membership.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link to="/pricing" className="btn-primary"><CreditCard size={16} />{plan ? 'Change plan' : 'Choose a plan'}</Link>
            {plan && <button onClick={cancel} disabled={cancelling} className="btn-ghost text-rose-300 hover:text-rose-200">{cancelling ? 'Cancelling…' : 'Cancel'}</button>}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b hairline">
          <Receipt size={16} className="text-brand-400" />
          <p className="font-display font-semibold text-white">Payment history</p>
        </div>
        {payments.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-zinc-500">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
                <tr><th className="px-6 py-3 font-medium">Date</th><th className="px-6 py-3 font-medium">Plan</th><th className="px-6 py-3 font-medium">Receipt</th><th className="px-6 py-3 font-medium text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-3 text-zinc-300">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-zinc-300">{p.plan?.name || '—'}</td>
                    <td className="px-6 py-3 font-mono text-xs text-zinc-500">{p.reference}</td>
                    <td className="px-6 py-3 text-right text-white tabular-nums">${p.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
