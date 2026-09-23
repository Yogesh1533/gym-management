import React, { useEffect, useState } from 'react';
import { sessionAPI, bookingAPI } from '../../services/api';
import SessionCard from '../../components/shared/SessionCard';
import toast from 'react-hot-toast';
import { Search, LayoutGrid, CalendarDays } from 'lucide-react';
import WeekView from '../../components/member/WeekView';
import PageLoader from '../../components/shared/PageLoader';

const SESSION_TYPES = ['all', 'hiit', 'yoga', 'strength', 'cardio', 'pilates', 'crossfit', 'general'];

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myWaitlist, setMyWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');

  useEffect(() => {
    Promise.all([sessionAPI.getUpcoming(), bookingAPI.getMyBookings(), bookingAPI.getMyWaitlist()])
      .then(([s, b, w]) => {
        setSessions(s.data);
        setMyBookings(b.data.filter(bk => bk.status !== 'cancelled').map(bk => bk.sessionId));
        setMyWaitlist(w.data.map(wl => wl.sessionId));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (sessionId) => {
    setBookingId(sessionId);
    try {
      const { data } = await bookingAPI.book(sessionId);
      if (data.waitlisted) {
        setMyWaitlist(prev => [...prev, sessionId]);
        toast('Added to waitlist! You\'ll be notified if a spot opens.', { icon: '⏳' });
      } else {
        setMyBookings(prev => [...prev, sessionId]);
        setSessions(prev => prev.map(s =>
          s.id === sessionId ? { ...s, bookedSlots: s.bookedSlots + 1 } : s
        ));
        toast.success('Session booked! Check your notifications.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingId(null);
    }
  };

  const filtered = sessions.filter(s => {
    const matchType = filter === 'all' || s.sessionType === filter;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.trainer.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="page-title">Classes</h1>
            <p className="text-zinc-500 mt-1">Reserve your spot. Full classes have a waitlist that books you automatically.</p>
          </div>
          <div className="inline-flex rounded-xl border hairline bg-white/[0.02] p-1 self-start" role="tablist" aria-label="View">
            {[['grid', 'Cards', LayoutGrid], ['week', 'Week', CalendarDays]].map(([key, label, Icon]) => (
              <button key={key} onClick={() => setView(key)} role="tab" aria-selected={view === key}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${view === key ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input pl-9" placeholder="Search by title or trainer..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SESSION_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === t ? 'bg-brand-400 text-ink-950' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {view === 'week' ? (
        <WeekView sessions={filtered} myBookings={myBookings} myWaitlist={myWaitlist} onBook={handleBook} bookingId={bookingId} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-lg">No sessions found.</p>
          <p className="text-sm mt-1">Try a different filter or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              onBook={handleBook}
              booked={myBookings.includes(s.id)}
              waitlisted={myWaitlist.includes(s.id)}
              loading={bookingId === s.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
