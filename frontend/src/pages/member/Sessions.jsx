import React, { useEffect, useState } from 'react';
import { sessionAPI, bookingAPI } from '../../services/api';
import SessionCard from '../../components/shared/SessionCard';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

const SESSION_TYPES = ['all', 'hiit', 'yoga', 'strength', 'cardio', 'pilates', 'crossfit', 'general'];

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myWaitlist, setMyWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([sessionAPI.getUpcoming(), bookingAPI.getMyBookings(), bookingAPI.getMyWaitlist()])
      .then(([s, b, w]) => {
        setSessions(s.data);
        setMyBookings(b.data.map(bk => bk.session?.id).filter(Boolean));
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Training Sessions</h1>
        <p className="text-zinc-500 mt-1">Book your spot in upcoming group training sessions.</p>
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
                filter === t ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
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
