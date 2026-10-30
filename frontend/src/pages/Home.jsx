import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Calendar, CheckCircle2, ChevronDown, Clock, Dumbbell,
  LineChart, MapPin, Salad, Sparkles, Users, Bell, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sessionAPI, membershipAPI, leadAPI } from '../services/api';
import { parseDate } from '../utils/date';
import Footer from '../components/shared/Footer';
import { SITE } from '../config/site';

const CLASS_TYPES = ['Strength', 'HIIT', 'Yoga', 'Pilates', 'CrossFit', 'Cardio', 'Mobility', 'Conditioning'];

const typeStyles = {
  hiit: 'text-rose-300 bg-rose-400/10 ring-rose-400/20',
  yoga: 'text-violet-300 bg-violet-400/10 ring-violet-400/20',
  strength: 'text-sky-300 bg-sky-400/10 ring-sky-400/20',
  cardio: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/20',
  pilates: 'text-pink-300 bg-pink-400/10 ring-pink-400/20',
  crossfit: 'text-amber-300 bg-amber-400/10 ring-amber-400/20',
  general: 'text-zinc-300 bg-white/5 ring-white/10',
};

const COACHES = [
  { name: 'Alex Rivera', role: 'Head of Conditioning', focus: 'HIIT · Fat loss', tone: 'from-rose-400/40' },
  { name: 'Emma Clarke', role: 'Yoga & Mobility Lead', focus: 'Yoga · Pilates', tone: 'from-violet-400/40' },
  { name: 'Marcus Hale', role: 'Strength Coach', focus: 'Powerlifting · Form', tone: 'from-sky-400/40' },
  { name: 'Lisa Moreno', role: 'Cardio Specialist', focus: 'Kickboxing · Spin', tone: 'from-emerald-400/40' },
  { name: 'Jake Turner', role: 'CrossFit Coach', focus: 'WODs · Olympic lifts', tone: 'from-amber-400/40' },
];

const FEATURES = [
  { icon: Sparkles, title: 'Plans built around you', text: 'Enter your stats and goal. We calculate BMI, calories and macros, then build a workout split and meal plan for the days you can train.', span: 'lg:col-span-2' },
  { icon: Calendar, title: 'Book in seconds', text: 'See live availability, reserve your spot, or join the waitlist. You are auto-booked if a spot opens.' },
  { icon: LineChart, title: 'Progress you can see', text: 'Log your weight and watch the trend line. Earn badges as you build the habit.' },
  { icon: Salad, title: 'Nutrition, handled', text: 'Full meal plans with calories and macros per item — or build one from foods you actually like.' },
  { icon: Bell, title: 'Always in the loop', text: 'Booking confirmations, new classes and waitlist spots land in your notifications instantly.' },
];

const FAQS = [
  { q: 'How does the free trial work?', a: 'Send the form below and our team will contact you within 24 hours to book a free class and a quick tour. No payment details needed.' },
  { q: 'Can I change or cancel my membership?', a: 'Yes. Upgrade, downgrade or cancel any time from Profile → Membership & billing. There are no lock-in contracts.' },
  { q: 'What if a class is full?', a: 'Join the waitlist. If someone cancels, the first person waiting is booked automatically and notified.' },
  { q: 'Do I need experience?', a: 'No. Every class has scaling options and your generated plan matches your level — beginner, intermediate or advanced.' },
];

const dayLabel = (dateStr) => {
  const d = parseDate(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
};

function HeroPreview({ nextClass }) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
      <div className="absolute -inset-10 bg-[radial-gradient(closest-side,rgba(201,160,74,0.25),transparent)] blur-2xl" />
      <div className="relative grid gap-4">
        <div className="card p-5 backdrop-blur animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-zinc-500">Next class</span>
            <span className="badge ring-1 text-emerald-300 bg-emerald-400/10 ring-emerald-400/20">Booked</span>
          </div>
          <p className="mt-3 font-display text-xl font-semibold text-white">{nextClass?.title || 'Strength Fundamentals'}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand-400" />{nextClass ? `${dayLabel(nextClass.date)} · ${nextClass.startTime}` : 'Tomorrow · 18:00'}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-400" />{nextClass?.location || 'Weight Room'}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="card col-span-3 p-5 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <span className="text-xs uppercase tracking-wider text-zinc-500">This week</span>
            <div className="mt-4 flex items-end gap-1.5 h-20">
              {[40, 65, 30, 80, 55, 95, 20].map((h, i) => (
                <div key={i} className="flex-1 rounded-md bg-gradient-to-t from-brand-600/40 to-brand-300" style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.55 }} />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
          </div>
          <div className="card col-span-2 p-5 flex flex-col items-center justify-center animate-fade-up" style={{ animationDelay: '450ms' }}>
            <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" strokeDasharray="97.4" strokeDashoffset="24" />
              <defs><linearGradient id="g"><stop offset="0" stopColor="#ecdcb3" /><stop offset="1" stopColor="#a9823a" /></linearGradient></defs>
            </svg>
            <span className="mt-2 text-xs text-zinc-500">Goal progress</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-brand-400/30 bg-gradient-to-br from-brand-300/20 via-ink-850 to-ink-900 p-5 animate-fade-up" style={{ animationDelay: '600ms' }}>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-400/20 blur-2xl" />
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Elite member</p>
          <p className="mt-6 font-display text-lg text-white tracking-wide">PY FITNESS</p>
          <div className="mt-1 flex justify-between text-xs text-zinc-400"><span>Unlimited classes</span><span>Renews monthly</span></div>
        </div>
      </div>
    </div>
  );
}

function TrialForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', goal: 'general_fitness', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await leadAPI.create(form);
      setDone(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (done) return (
    <div className="card flex flex-col items-center text-center py-12">
      <CheckCircle2 size={44} className="text-emerald-400" />
      <p className="mt-4 font-display text-xl font-semibold text-white">You're on the list</p>
      <p className="mt-2 max-w-sm text-sm text-zinc-400">{done}</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="card grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="t-name">Full name</label>
        <input id="t-name" className="input" required maxLength={100} value={form.name} onChange={set('name')} placeholder="Jordan Lee" />
      </div>
      <div>
        <label className="label" htmlFor="t-email">Email</label>
        <input id="t-email" type="email" className="input" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
      </div>
      <div>
        <label className="label" htmlFor="t-phone">Phone <span className="normal-case tracking-normal text-zinc-600">(optional)</span></label>
        <input id="t-phone" className="input" maxLength={30} value={form.phone} onChange={set('phone')} placeholder="0400 000 000" />
      </div>
      <div>
        <label className="label" htmlFor="t-goal">Main goal</label>
        <select id="t-goal" className="input" value={form.goal} onChange={set('goal')}>
          <option value="general_fitness">General fitness</option>
          <option value="weight_loss">Lose weight</option>
          <option value="muscle_gain">Build muscle</option>
          <option value="endurance">Improve endurance</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="t-msg">Anything we should know? <span className="normal-case tracking-normal text-zinc-600">(optional)</span></label>
        <textarea id="t-msg" className="input min-h-[90px]" maxLength={1000} value={form.message} onChange={set('message')} placeholder="Preferred times, injuries, questions…" />
      </div>
      <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-zinc-500 flex items-center gap-1.5"><ShieldCheck size={14} className="text-brand-400" /> No payment details needed.</p>
        <button type="submit" disabled={sending} className="btn-primary px-6 py-3">
          {sending ? 'Sending…' : <>Claim free trial <ArrowRight size={16} /></>}
        </button>
      </div>
    </form>
  );
}

export default function Home() {
  const [schedule, setSchedule] = useState([]);
  const [plans, setPlans] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    sessionAPI.getPublic().then(r => setSchedule(r.data)).catch(() => {});
    membershipAPI.getPublicPlans().then(r => setPlans(r.data)).catch(() => {});
  }, []);

  const scheduleByDay = useMemo(() => {
    const groups = {};
    schedule.forEach(s => { (groups[s.date] = groups[s.date] || []).push(s); });
    return Object.entries(groups).slice(0, 4);
  }, [schedule]);

  const lowestPrice = plans.length ? Math.min(...plans.map(p => p.billingCycle === 'yearly' ? p.price / 12 : p.price)) : null;
  const nextClass = schedule[0];

  return (
    <div className="-mt-16">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0 bg-grid mask-fade-b" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-up">
            <span className="eyebrow"><span className="h-px w-8 bg-brand-400" /> Members-first training club</span>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] text-white">
              Train with intent.<br />
              <span className="font-serif italic font-normal text-gradient pr-[0.15em]">Live stronger.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">
              Coached small-group classes, training and meal plans built for your body, and progress tracking that keeps you coming back.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#trial" className="btn-primary px-6 py-3 text-base">Start your free trial <ArrowRight size={18} /></a>
              <a href="#schedule" className="btn-secondary px-6 py-3 text-base">See this week's classes</a>
            </div>
            <dl className="mt-12 grid grid-cols-3 max-w-md gap-6 border-t hairline pt-6">
              <div><dt className="text-xs text-zinc-500">Classes this week</dt><dd className="mt-1 font-display text-2xl text-white tabular-nums">{schedule.length || '—'}</dd></div>
              <div><dt className="text-xs text-zinc-500">Expert coaches</dt><dd className="mt-1 font-display text-2xl text-white">{COACHES.length}</dd></div>
              <div><dt className="text-xs text-zinc-500">Plans from</dt><dd className="mt-1 font-display text-2xl text-white">{lowestPrice ? `$${Math.round(lowestPrice)}` : '—'}<span className="text-sm text-zinc-500">/mo</span></dd></div>
            </dl>
          </div>
          <HeroPreview nextClass={nextClass} />
        </div>
      </section>

      {/* Class types marquee */}
      <div className="border-y hairline bg-ink-900/60 py-5 overflow-hidden mask-fade-x" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-12">
          {[...CLASS_TYPES, ...CLASS_TYPES].map((t, i) => (
            <span key={i} className="flex items-center gap-12 font-display text-sm uppercase tracking-[0.3em] text-zinc-500">
              {t}<span className="h-1 w-1 rounded-full bg-brand-500" />
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="eyebrow">The membership</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-semibold text-white">Everything between you and your best shape.</h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text, span }) => (
              <div key={title} className={`card card-hover group ${span || ''}`}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400/10 ring-1 ring-brand-400/20 text-brand-300 group-hover:bg-brand-400/20 transition-colors">
                  <Icon size={20} />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live schedule */}
      <section id="schedule" className="scroll-mt-20 py-24 border-t hairline bg-gradient-to-b from-ink-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="eyebrow"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span> Live schedule</span>
              <h2 className="mt-4 text-4xl font-semibold text-white">This week on the floor</h2>
            </div>
            <Link to="/register" className="btn-secondary self-start sm:self-auto">Create account to book <ArrowUpRight size={16} /></Link>
          </div>

          {scheduleByDay.length === 0 ? (
            <p className="mt-12 text-zinc-500">New classes are being scheduled. Check back soon.</p>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {scheduleByDay.map(([date, items]) => (
                <div key={date} className="card p-0 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b hairline bg-white/[0.02]">
                    <span className="font-display font-semibold text-white">{dayLabel(date)}</span>
                    <span className="text-xs text-zinc-500">{items.length} {items.length === 1 ? 'class' : 'classes'}</span>
                  </div>
                  <ul className="divide-y divide-white/[0.06]">
                    {items.map(s => {
                      const left = s.totalSlots - s.bookedSlots;
                      return (
                        <li key={s.id} className="flex items-center gap-4 px-5 py-4">
                          <div className="w-14 shrink-0 font-display text-sm text-zinc-300 tabular-nums">{s.startTime}</div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-white">{s.title}</p>
                            <p className="text-xs text-zinc-500">{s.trainer} · {s.location}</p>
                          </div>
                          <span className={`badge ring-1 capitalize hidden sm:inline-flex ${typeStyles[s.sessionType] || typeStyles.general}`}>{s.sessionType}</span>
                          <span className={`w-20 text-right text-xs ${left <= 0 ? 'text-rose-400' : left <= 3 ? 'text-amber-300' : 'text-zinc-400'}`}>
                            {left <= 0 ? 'Waitlist' : `${left} left`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Coaches */}
      <section id="coaches" className="scroll-mt-20 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="eyebrow">The coaches</span>
            <h2 className="mt-4 text-4xl font-semibold text-white">Coached, not just supervised.</h2>
            <p className="mt-4 text-zinc-400">Every class is led by a certified coach who knows your name, your goal and your form.</p>
          </div>
          <div className="mt-14 grid gap-4 grid-cols-2 lg:grid-cols-5">
            {COACHES.map(c => (
              <div key={c.name} className="card card-hover p-0 overflow-hidden">
                <div className={`relative h-28 sm:h-40 bg-gradient-to-br ${c.tone} via-ink-850 to-ink-900 flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-grid opacity-40" />
                  <span className="relative font-display text-4xl sm:text-5xl font-semibold text-white/90">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="p-5">
                  <p className="font-display font-semibold text-white">{c.name}</p>
                  <p className="text-sm text-brand-300">{c.role}</p>
                  <p className="mt-2 text-xs text-zinc-500">{c.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-3">
          <div>
            <span className="eyebrow">How it works</span>
            <h2 className="mt-4 text-4xl font-semibold text-white">Three steps to your first session.</h2>
          </div>
          <ol className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
            {[
              { n: '01', t: 'Claim a free trial', d: 'Tell us your goal. We will book you a free class and a tour.', icon: Users },
              { n: '02', t: 'Get your plan', d: 'Your workout split and meal plan, generated from your stats in seconds.', icon: Dumbbell },
              { n: '03', t: 'Book & track', d: 'Reserve classes, log progress and unlock achievements as you go.', icon: LineChart },
            ].map(({ n, t, d, icon: Icon }) => (
              <li key={n} className="card">
                <div className="flex items-center justify-between">
                  <span className="font-serif italic text-3xl text-brand-300">{n}</span>
                  <Icon size={18} className="text-zinc-600" />
                </div>
                <p className="mt-6 font-semibold text-white">{t}</p>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Membership preview */}
      {plans.length > 0 && (
        <section className="py-24 border-t hairline bg-gradient-to-b from-ink-900/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <span className="eyebrow">Membership</span>
                <h2 className="mt-4 text-4xl font-semibold text-white">Simple pricing. No lock-in.</h2>
              </div>
              <Link to="/pricing" className="btn-secondary self-start sm:self-auto">Compare all plans <ArrowUpRight size={16} /></Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map(p => (
                <Link key={p.id} to="/pricing" className={`card card-hover block ${p.tier === 'premium' ? 'border-brand-400/40 shadow-glow' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-display font-semibold text-white">{p.name}</p>
                    {p.tier === 'premium' && <span className="badge bg-brand-400/15 text-brand-200">Popular</span>}
                  </div>
                  <p className="mt-4 font-display text-3xl text-white">${p.price}<span className="text-sm text-zinc-500">/{p.billingCycle === 'yearly' ? 'yr' : 'mo'}</span></p>
                  <p className="mt-2 text-sm text-zinc-500">{p.sessionLimit === -1 ? 'Unlimited classes' : `${p.sessionLimit} classes / month`}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Free trial + FAQ */}
      <section id="trial" className="scroll-mt-20 py-24 sm:py-32 border-t hairline relative overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-14 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="eyebrow">Free trial</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-semibold text-white">Your first class is on us.</h2>
            <p className="mt-4 text-zinc-400">Leave your details and a coach will reach out to book your free session and a tour of the club.</p>
            <ul className="mt-8 space-y-3 text-sm text-zinc-300">
              {['One free coached class', 'Personal goal consultation', 'Tour of the facilities'].map(t => (
                <li key={t} className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-brand-400" />{t}</li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-zinc-500 flex items-center gap-2"><MapPin size={15} className="text-brand-400" /> {SITE.address}</p>
          </div>
          <div className="lg:col-span-3"><TrialForm /></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <h3 className="text-center text-2xl font-semibold text-white">Questions, answered</h3>
          <div className="mt-8 divide-y divide-white/[0.07] border-y hairline">
            {FAQS.map((f, i) => (
              <div key={f.q}>
                <button
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-white">{f.q}</span>
                  <ChevronDown size={18} className={`shrink-0 text-zinc-500 transition-transform ${openFaq === i ? 'rotate-180 text-brand-400' : ''}`} />
                </button>
                {openFaq === i && <p className="pb-5 -mt-1 text-sm leading-relaxed text-zinc-400">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
