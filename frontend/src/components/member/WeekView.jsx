import { parseDate } from '../../utils/date';

const dot = {
  hiit: 'bg-rose-400', yoga: 'bg-violet-400', strength: 'bg-sky-400', cardio: 'bg-emerald-400',
  pilates: 'bg-pink-400', crossfit: 'bg-amber-400', general: 'bg-zinc-400',
};

const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Seven-day calendar of classes starting today
export default function WeekView({ sessions, myBookings, myWaitlist, onBook, bookingId }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <div className="grid min-w-[980px] grid-cols-7 gap-3">
        {days.map((d, i) => {
          const key = toKey(d);
          const items = sessions.filter(s => String(s.date).slice(0, 10) === key)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          return (
            <div key={key} className={`rounded-2xl border p-3 min-h-[260px] ${i === 0 ? 'border-brand-400/30 bg-brand-400/[0.04]' : 'border-white/[0.07] bg-white/[0.02]'}`}>
              <div className="mb-3 flex items-baseline justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <span className={`font-display text-lg ${i === 0 ? 'text-brand-300' : 'text-white'}`}>{d.getDate()}</span>
              </div>
              <div className="space-y-2">
                {items.length === 0 && <p className="px-1 pt-6 text-center text-xs text-zinc-600">No classes</p>}
                {items.map(s => {
                  const booked = myBookings.includes(s.id);
                  const waiting = myWaitlist.includes(s.id);
                  const left = s.totalSlots - s.bookedSlots;
                  const date = parseDate(s.date);
                  return (
                    <div key={s.id} className="rounded-xl border border-white/[0.07] bg-ink-900 p-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 tabular-nums">
                        <span className={`h-1.5 w-1.5 rounded-full ${dot[s.sessionType] || dot.general}`} />
                        {s.startTime}–{s.endTime}
                      </div>
                      <p className="mt-1 text-sm font-medium leading-snug text-white" title={`${s.title} · ${date.toDateString()}`}>{s.title}</p>
                      <p className="text-[11px] text-zinc-500">{s.trainer}</p>
                      <button
                        onClick={() => onBook(s.id)}
                        disabled={booked || waiting || bookingId === s.id}
                        className={`mt-2 w-full rounded-lg py-1 text-[11px] font-semibold transition-colors ${
                          booked ? 'bg-emerald-400/10 text-emerald-300'
                          : waiting ? 'bg-amber-400/10 text-amber-300'
                          : left <= 0 ? 'bg-white/5 text-zinc-300 hover:bg-white/10'
                          : 'bg-brand-400/15 text-brand-200 hover:bg-brand-400/25'
                        }`}
                      >
                        {booked ? 'Booked' : waiting ? 'Waitlisted' : bookingId === s.id ? '…' : left <= 0 ? 'Join waitlist' : `Book · ${left} left`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
