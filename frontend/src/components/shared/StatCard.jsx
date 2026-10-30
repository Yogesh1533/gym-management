const tones = {
  brand:  'text-brand-300 bg-brand-400/10 ring-brand-400/20',
  cyan:   'text-brand-300 bg-brand-400/10 ring-brand-400/20',
  blue:   'text-sky-300 bg-sky-400/10 ring-sky-400/20',
  green:  'text-emerald-300 bg-emerald-400/10 ring-emerald-400/20',
  purple: 'text-violet-300 bg-violet-400/10 ring-violet-400/20',
  red:    'text-rose-300 bg-rose-400/10 ring-rose-400/20',
  orange: 'text-amber-300 bg-amber-400/10 ring-amber-400/20',
};

export default function StatCard({ title, value, icon: Icon, color = 'brand', subtitle }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</p>
        {Icon && (
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${tones[color] || tones.brand}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-white tabular-nums">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
    </div>
  );
}
