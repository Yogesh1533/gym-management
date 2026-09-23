import React, { useEffect, useState } from 'react';
import { Award, Calendar, Check, Compass, Crown, Dumbbell, Flag, Flame, LineChart, Target, User } from 'lucide-react';
import { userAPI } from '../../services/api';

const ICONS = { flag: Flag, calendar: Calendar, flame: Flame, check: Check, dumbbell: Dumbbell, compass: Compass, chart: LineChart, target: Target, user: User, crown: Crown };

export default function Achievements({ compact = false }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    userAPI.getAchievements().then(r => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return null;
  const items = compact
    ? [...data.achievements].sort((a, b) => Number(b.earned) - Number(a.earned) || (b.current / b.target) - (a.current / a.target)).slice(0, 5)
    : data.achievements;
  const pct = Math.round((data.earned / data.total) * 100);

  return (
    <section className="card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-brand-400" />
          <h2 className="font-display font-semibold text-white">Achievements</h2>
        </div>
        <span className="text-sm text-zinc-400 tabular-nums">{data.earned} / {data.total} unlocked</span>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-300 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>

      <ul className={`mt-6 grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {items.map(a => {
          const Icon = ICONS[a.icon] || Award;
          return (
            <li key={a.id} title={a.description}
              className={`rounded-xl border p-4 text-center transition-colors ${a.earned ? 'border-brand-400/30 bg-brand-400/[0.06]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <span className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
                a.earned ? 'bg-gradient-to-br from-brand-200 to-brand-500 text-ink-950 shadow-glow' : 'bg-white/5 text-zinc-600'
              }`}>
                <Icon size={18} />
              </span>
              <p className={`mt-3 text-sm font-medium ${a.earned ? 'text-white' : 'text-zinc-400'}`}>{a.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{a.description}</p>
              {!a.earned && a.target > 1 && (
                <p className="mt-2 text-[11px] text-zinc-500 tabular-nums">{a.current}/{a.target}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
