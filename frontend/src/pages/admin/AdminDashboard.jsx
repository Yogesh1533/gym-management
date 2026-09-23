import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Filler
} from 'chart.js';
import { DollarSign, Users, CalendarCheck, Inbox, ArrowUpRight, Calendar, TrendingUp } from 'lucide-react';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import PageLoader from '../../components/shared/PageLoader';
import { formatShortDate } from '../../utils/date';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Filler);

const GOLD = '#d9b465';
const INK = { text: '#a1a1aa', muted: '#71717a', grid: 'rgba(255,255,255,0.05)', surface: '#121217' };

const TYPE_LABELS = { hiit: 'HIIT', crossfit: 'CrossFit', yoga: 'Yoga', strength: 'Strength', cardio: 'Cardio', pilates: 'Pilates', general: 'General' };

const money = (n) => `$${Math.round(n).toLocaleString()}`;

// Shared, recessive chart styling: faint grid, muted ticks, tooltip on hover
const baseOptions = (valueFormat = (v) => v, horizontal = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: horizontal ? 'y' : 'x',
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#18181e', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
      titleColor: '#fafafa', bodyColor: INK.text, padding: 10, displayColors: false,
      callbacks: { label: (ctx) => valueFormat(horizontal ? ctx.parsed.x : ctx.parsed.y) },
    },
  },
  scales: {
    x: {
      grid: { display: horizontal, color: INK.grid, drawTicks: false }, border: { display: false },
      ticks: { color: INK.muted, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 12, ...(horizontal && { callback: (v) => valueFormat(v) }) },
      beginAtZero: true,
    },
    y: {
      grid: { display: !horizontal, color: INK.grid, drawTicks: false }, border: { display: false },
      ticks: { color: horizontal ? INK.text : INK.muted, font: { size: 11 }, padding: 8, precision: 0, ...(!horizontal && { callback: (v) => valueFormat(v) }) },
      beginAtZero: true,
    },
  },
});

const barDataset = (data) => ({
  data, backgroundColor: GOLD, hoverBackgroundColor: '#ecdcb3',
  borderRadius: 4, borderSkipped: 'start', maxBarThickness: 22, categoryPercentage: 0.7,
});

function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getDashboard(), adminAPI.getAnalytics()])
      .then(([d, a]) => { setStats(d.data); setAnalytics(a.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats || !analytics) return <PageLoader />;

  const monthLabel = (m) => new Date(`${m}-15`).toLocaleDateString(undefined, { month: 'short' });
  const dayLabel = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  const revenueChange = (() => {
    const r = analytics.revenueByMonth;
    const prev = r[r.length - 2]?.total || 0;
    if (!prev) return null;
    return Math.round(((r[r.length - 1].total - prev) / prev) * 100);
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="page-title mt-2">Club performance</h1>
        </div>
        <Link to="/admin/sessions" className="btn-primary self-start">Schedule a class</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Revenue this month" value={money(analytics.revenueThisMonth)} icon={DollarSign} color="brand"
          subtitle={revenueChange === null ? `${money(analytics.revenueTotal)} all time` : `${revenueChange >= 0 ? '▲' : '▼'} ${Math.abs(revenueChange)}% vs last month`} />
        <StatCard title="Active members" value={analytics.activeMembers} icon={Users} color="blue"
          subtitle={`${analytics.newMembersThisMonth} joined this month`} />
        <StatCard title="Attendance rate" value={analytics.attendanceRate === null ? '—' : `${analytics.attendanceRate}%`} icon={CalendarCheck} color="green"
          subtitle="Of booked spots in past classes" />
        <Link to="/admin/leads" className="block">
          <StatCard title="New trial leads" value={analytics.newLeads} icon={Inbox} color="purple" subtitle="Waiting for follow-up →" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <ChartCard title="Revenue" subtitle="Membership payments, last 6 months">
            <div className="h-64">
              <Line
                data={{
                  labels: analytics.revenueByMonth.map(r => monthLabel(r.month)),
                  datasets: [{
                    data: analytics.revenueByMonth.map(r => r.total),
                    borderColor: GOLD, borderWidth: 2, cubicInterpolationMode: 'monotone', fill: true,
                    backgroundColor: (ctx) => {
                      const { chart } = ctx; const { ctx: c, chartArea } = chart;
                      if (!chartArea) return 'rgba(217,180,101,0.1)';
                      const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                      g.addColorStop(0, 'rgba(217,180,101,0.25)'); g.addColorStop(1, 'rgba(217,180,101,0)');
                      return g;
                    },
                    pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: GOLD,
                    pointHoverBorderColor: INK.surface, pointHoverBorderWidth: 2,
                  }],
                }}
                options={baseOptions(money)}
              />
            </div>
          </ChartCard>
        </div>
        <ChartCard title="Members by plan" subtitle="Current membership mix">
          <ul className="space-y-4">
            {analytics.membersByPlan.map(p => {
              const max = Math.max(...analytics.membersByPlan.map(x => x.count));
              return (
                <li key={p.name}>
                  <div className="flex justify-between text-sm"><span className="text-zinc-300">{p.name}</span><span className="text-white tabular-nums">{p.count}</span></div>
                  <div className="mt-1.5 h-2 rounded-full bg-white/5">
                    <div className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-300" style={{ width: `${(p.count / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <ChartCard title="Bookings" subtitle="New class bookings per day, last 14 days">
            <div className="h-56">
              <Bar
                data={{ labels: analytics.bookingsByDay.map(d => dayLabel(d.day)), datasets: [barDataset(analytics.bookingsByDay.map(d => d.count))] }}
                options={baseOptions(v => `${v} booking${v === 1 ? '' : 's'}`)}
              />
            </div>
          </ChartCard>
        </div>
        <ChartCard title="Popular classes" subtitle="Bookings by class type">
          <div className="h-56">
            <Bar
              data={{
                labels: analytics.classPopularity.map(c => TYPE_LABELS[c.type] || c.type),
                datasets: [barDataset(analytics.classPopularity.map(c => c.count))],
              }}
              options={baseOptions(v => `${v} booking${v === 1 ? '' : 's'}`, true)}
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Recent bookings" action={<Link to="/admin/bookings" className="text-xs text-brand-300 hover:text-brand-200 flex items-center gap-1">View all <ArrowUpRight size={13} /></Link>}>
          {stats.recentBookings.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {stats.recentBookings.map(b => (
                <li key={b.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-zinc-300">{b.member?.name?.charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{b.member?.name}</p>
                    <p className="truncate text-xs text-zinc-500">{b.session?.title}</p>
                  </div>
                  <span className="text-xs text-zinc-500">{formatShortDate(b.session?.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard title="Upcoming classes" action={<Link to="/admin/sessions" className="text-xs text-brand-300 hover:text-brand-200 flex items-center gap-1">Manage <ArrowUpRight size={13} /></Link>}>
          {stats.upcomingSessions.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">No upcoming classes.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {stats.upcomingSessions.map(s => {
                const fill = Math.round((s.bookedSlots / s.totalSlots) * 100);
                return (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <Calendar size={16} className="shrink-0 text-zinc-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{s.title}</p>
                      <p className="text-xs text-zinc-500">{formatShortDate(s.date)} · {s.startTime} · {s.trainer}</p>
                    </div>
                    <div className="w-24 text-right">
                      <p className="text-xs text-zinc-400 tabular-nums">{s.bookedSlots}/{s.totalSlots}</p>
                      <div className="mt-1 h-1 rounded-full bg-white/5"><div className={`h-1 rounded-full ${fill >= 100 ? 'bg-rose-400' : 'bg-brand-400'}`} style={{ width: `${Math.min(fill, 100)}%` }} /></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-zinc-600"><TrendingUp size={13} /> {stats.totalSessions} classes · {stats.totalBookings} bookings · {stats.workoutPlans} workout plans · {stats.dietPlans} diet plans on record</p>
    </div>
  );
}
