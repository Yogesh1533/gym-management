import { Link } from 'react-router-dom';

// Monogram mark + wordmark
export default function Logo({ to = '/', size = 'md', suffix }) {
  const box = size === 'lg' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm';
  const text = size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <Link to={to} className="flex items-center gap-2.5 group" aria-label="PY Fitness home">
      <span className={`${box} rounded-xl bg-gradient-to-br from-brand-200 via-brand-400 to-brand-600 text-ink-950 font-display font-bold flex items-center justify-center shadow-glow`}>
        PY
      </span>
      <span className={`font-display font-semibold tracking-tight text-white ${text}`}>
        Fitness<span className="text-brand-400">.</span>
      </span>
      {suffix && (
        <span className="ml-1 rounded-full border border-brand-400/30 bg-brand-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
          {suffix}
        </span>
      )}
    </Link>
  );
}
