import { Link } from 'react-router-dom';
import { MapPin, Clock, Mail, Phone } from 'lucide-react';
import Logo from './Logo';
import { SITE } from '../../config/site';

export default function Footer() {
  return (
    <footer className="border-t hairline bg-ink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            A members-first training club. Coached classes, personal plans and progress tracking, all in one place.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm text-zinc-500">
            <li><a href="/#schedule" className="hover:text-white transition-colors">Class schedule</a></li>
            <li><a href="/#coaches" className="hover:text-white transition-colors">Coaches</a></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Membership</Link></li>
            <li><a href="/#trial" className="hover:text-white transition-colors">Free trial</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Visit</p>
          <ul className="space-y-2.5 text-sm text-zinc-500">
            <li className="flex gap-2"><MapPin size={15} className="mt-0.5 text-brand-400 shrink-0" /> {SITE.address}</li>
            <li className="flex gap-2"><Clock size={15} className="mt-0.5 text-brand-400 shrink-0" /> {SITE.hours}</li>
            <li className="flex gap-2"><Phone size={15} className="mt-0.5 text-brand-400 shrink-0" /> {SITE.phone}</li>
            <li className="flex gap-2"><Mail size={15} className="mt-0.5 text-brand-400 shrink-0" /> {SITE.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-zinc-600">
          <span>© {new Date().getFullYear()} PY Fitness. All rights reserved.</span>
          <span>University capstone project · demo data resets daily</span>
        </div>
      </div>
    </footer>
  );
}
