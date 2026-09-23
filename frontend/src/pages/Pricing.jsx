import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { membershipAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Check, Crown } from 'lucide-react';
import PageLoader from '../components/shared/PageLoader';
import Footer from '../components/shared/Footer';

const tierOrder = { basic: 0, standard: 1, premium: 2, annual: 3 };

const COMPARISON = [
  ['Gym floor access', true, true, true, true],
  ['Class bookings per month', '2', 'Unlimited', 'Unlimited', 'Unlimited'],
  ['Generated workout & diet plan', true, true, true, true],
  ['Custom diet from your foods', false, true, true, true],
  ['Progress tracking & badges', true, true, true, true],
  ['Priority booking', false, false, true, true],
  ['Personal trainer sessions', false, false, true, true],
  ['Guest passes', false, false, false, '2 / month'],
];

export default function Pricing() {
  const { user, isAdmin } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requests = [membershipAPI.getPublicPlans()];
    if (user && !isAdmin) requests.push(membershipAPI.getMyMembership());
    Promise.all(requests)
      .then(([p, mine]) => {
        setPlans(p.data.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]));
        if (mine) setCurrentPlanId(mine.data.plan?.id || null);
      })
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  if (loading) return <PageLoader />;

  const ctaFor = (plan) => {
    if (isAdmin) return { to: '/admin/memberships', label: 'Manage plans' };
    if (!user) return { to: `/register?plan=${plan.id}`, label: 'Get started' };
    if (plan.id === currentPlanId) return null;
    const current = plans.find(p => p.id === currentPlanId);
    const label = !current ? 'Choose plan' : tierOrder[plan.tier] > tierOrder[current.tier] ? 'Upgrade' : 'Switch plan';
    return { to: `/checkout/${plan.id}`, label };
  };

  return (
    <div>
      <section className="relative overflow-hidden pt-16 pb-12 text-center px-4">
        <div className="absolute inset-0 bg-grid mask-fade-b" />
        <div className="relative">
          <span className="eyebrow justify-center">Membership</span>
          <h1 className="mt-4 text-5xl sm:text-6xl font-semibold text-white">
            Invest in <span className="font-serif italic font-normal text-gradient pr-[0.15em]">yourself.</span>
          </h1>
          <p className="mt-5 text-zinc-400 text-lg max-w-xl mx-auto">
            Transparent pricing, no joining fee and no lock-in. Change or cancel any time.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map(plan => {
            const featured = plan.tier === 'premium';
            const isCurrent = plan.id === currentPlanId;
            const cta = ctaFor(plan);
            return (
              <div key={plan.id} className={`relative flex flex-col rounded-2xl p-6 border transition-all ${
                featured
                  ? 'border-brand-400/50 bg-gradient-to-b from-brand-400/10 via-ink-850 to-ink-900 shadow-glow lg:-translate-y-3'
                  : 'border-white/[0.07] bg-gradient-to-b from-ink-850 to-ink-900'
              }`}>
                {featured && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-300 to-brand-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-950">
                    <Crown size={12} /> Most popular
                  </span>
                )}
                {plan.tier === 'annual' && (
                  <span className="absolute -top-3 left-6 rounded-full border border-emerald-400/30 bg-ink-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    Best value
                  </span>
                )}

                <p className="font-display text-lg font-semibold text-white">{plan.name}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-semibold text-white">${plan.price}</span>
                  <span className="text-zinc-500">/{plan.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
                <p className="mt-1 h-5 text-xs text-emerald-300">
                  {plan.billingCycle === 'yearly' ? `≈ $${Math.round(plan.price / 12)}/month · 2 months free` : ''}
                </p>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-400" />{f}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isCurrent ? (
                    <div className="w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-2.5 text-center text-sm font-semibold text-emerald-300">
                      Your current plan
                    </div>
                  ) : cta && (
                    <Link to={cta.to} className={`${featured ? 'btn-primary' : 'btn-secondary'} w-full py-2.5`}>{cta.label}</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {plans.length === 4 && (
        <section className="px-4 pb-24">
          <div className="max-w-6xl mx-auto card p-0 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b hairline">
                  <th className="py-4 px-6 text-left font-medium text-zinc-400">Compare plans</th>
                  {plans.map(p => <th key={p.id} className="py-4 px-4 text-center font-display font-semibold text-white">{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([label, ...vals]) => (
                  <tr key={label} className="border-b hairline last:border-0">
                    <td className="py-3.5 px-6 text-zinc-300">{label}</td>
                    {vals.map((v, i) => (
                      <td key={i} className="py-3.5 px-4 text-center">
                        {v === true ? <Check size={16} className="mx-auto text-brand-400" aria-label="Included" />
                          : v === false ? <span className="text-zinc-700" aria-label="Not included">—</span>
                          : <span className="text-zinc-300">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
