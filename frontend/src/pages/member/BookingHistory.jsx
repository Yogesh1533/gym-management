import React, { useEffect, useState } from 'react';
import { bookingAPI, ratingAPI } from '../../services/api';
import { Calendar, Clock, MapPin, User, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/date';

const statusColors = {
  confirmed: 'bg-emerald-500/10 text-emerald-400',
  cancelled:  'bg-red-500/10 text-red-400',
  attended:   'bg-blue-500/10 text-blue-400',
};

function StarRating({ sessionId, existingRating, onRated }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(existingRating || 0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const handleRate = async (star) => {
    setSelected(star);
    setShowReview(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await ratingAPI.rate(sessionId, selected, review);
      toast.success('Rating submitted!');
      onRated(sessionId, selected);
      setShowReview(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rate');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500 mr-1">Rate:</span>
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleRate(star)}
            className="transition-colors"
          >
            <Star
              size={16}
              className={star <= (hovered || selected) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}
            />
          </button>
        ))}
        {selected > 0 && <span className="text-xs text-zinc-500 ml-1">{selected}/5</span>}
      </div>
      {showReview && (
        <div className="mt-2 flex gap-2">
          <input
            className="input text-xs py-1 flex-1"
            placeholder="Optional review..."
            value={review}
            onChange={e => setReview(e.target.value)}
          />
          <button onClick={handleSubmit} disabled={saving} className="btn-primary text-xs px-3 py-1">
            {saving ? '...' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [myRatings, setMyRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    Promise.all([bookingAPI.getMyBookings(), ratingAPI.getMyRatings()])
      .then(([b, r]) => {
        setBookings(b.data);
        const rMap = {};
        r.data.forEach(rt => { rMap[rt.sessionId] = rt.rating; });
        setMyRatings(rMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingAPI.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  const handleRated = (sessionId, rating) => {
    setMyRatings(prev => ({ ...prev, [sessionId]: rating }));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="page-title mb-2">Booking History</h1>
      <p className="text-zinc-500 mb-8">All your training session bookings.</p>

      {bookings.length === 0 ? (
        <div className="card text-center py-16 text-zinc-600">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg">No bookings yet.</p>
          <a href="/sessions" className="text-brand-400 hover:underline text-sm mt-2 block">Browse sessions →</a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-white">{b.session?.title}</h3>
                  <span className={`badge ${statusColors[b.status]} capitalize`}>{b.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-zinc-500">
                  <span className="flex items-center gap-1"><User size={13} className="text-brand-400" />{b.session?.trainer}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} className="text-brand-400" />{formatDate(b.session?.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={13} className="text-brand-400" />{b.session?.startTime} – {b.session?.endTime}</span>
                  <span className="flex items-center gap-1"><MapPin size={13} className="text-brand-400" />{b.session?.location}</span>
                </div>
                <p className="text-xs text-zinc-600 mt-2">Booked on {new Date(b.createdAt).toLocaleDateString()}</p>
                {b.status !== 'cancelled' && (
                  <StarRating
                    sessionId={b.sessionId}
                    existingRating={myRatings[b.sessionId]}
                    onRated={handleRated}
                  />
                )}
              </div>
              {b.status === 'confirmed' && (
                <button
                  onClick={() => handleCancel(b.id)}
                  disabled={cancelling === b.id}
                  className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <X size={14} /> {cancelling === b.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
