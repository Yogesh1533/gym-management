import { Check } from 'lucide-react';
import Logo from '../shared/Logo';

// Split-screen layout shared by the sign-in and sign-up pages
export default function AuthShell({ title, subtitle, children, wide = false }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r hairline bg-ink-900 p-12">
        <div className="absolute inset-0 bg-grid mask-fade-b" />
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-brand-500/15 blur-[100px]" />
        <div className="relative"><Logo size="lg" /></div>
        <div className="relative max-w-md">
          <p className="font-display text-4xl font-semibold leading-tight text-white">
            Stronger every week, <span className="font-serif italic font-normal text-gradient pr-[0.15em]">by design.</span>
          </p>
          <ul className="mt-8 space-y-3 text-zinc-300">
            {['Coached classes with live availability', 'Workout & meal plans built from your stats', 'Progress tracking and achievements'].map(t => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-400/15 text-brand-300"><Check size={14} /></span>{t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-zinc-600">© {new Date().getFullYear()} PY Fitness</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'} animate-fade-up`}>
          <div className="lg:hidden mb-10"><Logo /></div>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-zinc-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
