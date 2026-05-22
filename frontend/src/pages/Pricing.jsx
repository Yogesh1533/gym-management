import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { membershipAPI } from '../services/api';
import { Check, Zap } from 'lucide-react';

const tierOrder = { basic: 0, standard: 1, premium: 2, annual: 3 };

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membershipAPI.getPublicPlans()
      .then(res => setPlans(res.data.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier])))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-black via-zinc-900 to-black py-20 px-4 text-center border-b border-zinc-800">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap size={14} /> Simple, Transparent Pricing
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-4">Choose Your Plan</h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Start your fitness journey today. Upgrade or cancel anytime.
        </p>
      </section>

      {/* Plans */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => {
            const isPopular = plan.tier === 'standard';
            const isAnnual  = plan.tier === 'annual';
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all hover:scale-105 ${
                  isPopular
                    ? 'border-cyan-500 bg-zinc-900 shadow-lg shadow-cyan-500/10'
                    : isAnnual
                    ? 'border-yellow-500/50 bg-zinc-900 shadow-lg shadow-yellow-500/10'
                    : 'border-zinc-800 bg-zinc-900'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                {isAnnual && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    BEST VALUE
                  </div>
                )}

                {/* Plan Name & Price */}
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: plan.color + '20', border: `1px solid ${plan.color}40` }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                    <span className="text-zinc-500 mb-1">/{plan.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  {plan.billingCycle === 'yearly' && (
                    <p className="text-xs text-yellow-400 mt-1">≈ ${Math.round(plan.price / 12)}/month — 2 months free!</p>
                  )}
                  <p className="text-xs text-zinc-500 mt-2">
                    {plan.sessionLimit === -1 ? 'Unlimited sessions' : `${plan.sessionLimit} sessions/month`}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className="w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-colors block"
                  style={{
                    backgroundColor: isPopular || isAnnual ? plan.color : 'transparent',
                    color: isPopular || isAnnual ? '#000' : plan.color,
                    border: `1px solid ${plan.color}`,
                  }}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your membership at any time. No long-term contracts.' },
              { q: 'Can I upgrade my plan?', a: 'Absolutely. You can upgrade or downgrade your plan at any time from your profile.' },
              { q: 'What happens when I hit my session limit?', a: 'On the Starter plan, you can book up to 2 sessions per month. Upgrade to Active or Elite for unlimited bookings.' },
              { q: 'Is there a free trial?', a: 'New members get a 7-day free trial on the Active plan. No credit card required.' },
            ].map((item, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="font-semibold text-white mb-2">{item.q}</p>
                <p className="text-zinc-500 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-black text-zinc-600 text-center py-6 text-sm border-t border-zinc-800">
        © 2024 PY Fitness Gym Management System.
      </footer>
    </div>
  );
}
