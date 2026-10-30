import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Info, Lock, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { membershipAPI } from '../../services/api';
import PageLoader from '../../components/shared/PageLoader';
import { formatDate } from '../../utils/date';

// Demo checkout: confirms the plan and records a payment on the server.
// No card details are collected, sent or stored.
export default function Checkout() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    Promise.all([membershipAPI.getPublicPlans(), membershipAPI.getMyMembership()])
      .then(([plans, mine]) => {
        setPlan(plans.data.find(p => String(p.id) === String(planId)) || null);
        setCurrent(mine.data.plan || null);
      })
      .finally(() => setLoading(false));
  }, [planId]);

  const confirm = async () => {
    setPaying(true);
    try {
      const { data } = await membershipAPI.subscribe(plan.id);
      setReceipt(data);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <PageLoader />;

  if (!plan) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-zinc-400">That plan isn't available.</p>
      <Link to="/pricing" className="btn-secondary mt-6">Back to plans</Link>
    </div>
  );

  if (receipt) return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="card text-center p-10 animate-fade-up">
        <CheckCircle2 size={52} className="mx-auto text-emerald-400" />
        <h1 className="mt-5 text-3xl font-semibold text-white">You're in.</h1>
        <p className="mt-2 text-zinc-400">Your <span className="text-white">{receipt.plan.name}</span> membership is active.</p>
        <dl className="mt-8 divide-y divide-white/[0.07] rounded-xl border hairline text-sm text-left">
          <div className="flex justify-between px-4 py-3"><dt className="text-zinc-500">Receipt</dt><dd className="font-mono text-zinc-200">{receipt.payment.reference}</dd></div>
          <div className="flex justify-between px-4 py-3"><dt className="text-zinc-500">Amount</dt><dd className="text-zinc-200">${receipt.payment.amount.toFixed(2)}</dd></div>
          <div className="flex justify-between px-4 py-3"><dt className="text-zinc-500">Renews</dt><dd className="text-zinc-200">{formatDate(receipt.renewsAt)}</dd></div>
        </dl>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/profile?tab=billing')} className="btn-secondary"><Receipt size={16} /> Billing</button>
          <button onClick={() => navigate('/sessions')} className="btn-primary">Book a class</button>
        </div>
      </div>
    </div>
  );

  const perMonth = plan.billingCycle === 'yearly' ? plan.price / 12 : plan.price;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/pricing" className="btn-ghost -ml-3 text-sm"><ArrowLeft size={16} /> All plans</Link>
      <h1 className="page-title mt-4">Checkout</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-zinc-500">You're joining</p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-semibold text-white">{plan.name}</p>
                <p className="text-sm text-zinc-400">
                  {plan.sessionLimit === -1 ? 'Unlimited classes' : `${plan.sessionLimit} classes per month`} · billed {plan.billingCycle}
                </p>
              </div>
              <p className="font-display text-2xl text-white">${plan.price}</p>
            </div>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {plan.features?.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300"><Check size={15} className="mt-0.5 shrink-0 text-brand-400" />{f}</li>
              ))}
            </ul>
            {current && (
              <p className="mt-6 rounded-xl border hairline bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
                This replaces your current <span className="text-white">{current.name}</span> plan straight away.
              </p>
            )}
          </div>

          <div className="flex gap-3 rounded-2xl border border-sky-400/20 bg-sky-400/5 p-4 text-sm text-sky-200">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p><span className="font-semibold">Demo checkout.</span> This project doesn't process real payments. Confirming records a sample payment and activates the plan. No card details are asked for or stored.</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card lg:sticky lg:top-24">
            <p className="font-display font-semibold text-white">Order summary</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-zinc-400">{plan.name} ({plan.billingCycle})</dt><dd className="text-zinc-200">${plan.price.toFixed(2)}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-400">Joining fee</dt><dd className="text-emerald-300">Waived</dd></div>
              <div className="flex justify-between border-t hairline pt-3"><dt className="font-semibold text-white">Due today</dt><dd className="font-display text-xl text-white">${plan.price.toFixed(2)}</dd></div>
            </dl>
            {plan.billingCycle === 'yearly' && <p className="mt-2 text-right text-xs text-zinc-500">Works out to ${perMonth.toFixed(2)} / month</p>}

            <label className="mt-6 flex items-start gap-2.5 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-400" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              I understand this membership renews automatically and I can cancel any time from my profile.
            </label>

            <button onClick={confirm} disabled={!agreed || paying} className="btn-primary mt-6 w-full py-3">
              <Lock size={16} /> {paying ? 'Activating…' : `Confirm & activate`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
