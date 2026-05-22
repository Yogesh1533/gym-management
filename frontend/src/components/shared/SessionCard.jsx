import { Calendar, Clock, MapPin, User, Users } from 'lucide-react';

const typeColors = {
  hiit: 'bg-red-500/10 text-red-400',
  yoga: 'bg-purple-500/10 text-purple-400',
  strength: 'bg-blue-500/10 text-blue-400',
  cardio: 'bg-emerald-500/10 text-emerald-400',
  pilates: 'bg-pink-500/10 text-pink-400',
  crossfit: 'bg-orange-500/10 text-orange-400',
  general: 'bg-zinc-700 text-zinc-300',
};

export default function SessionCard({ session, onBook, booked, waitlisted, loading }) {
  const available = session.totalSlots - session.bookedSlots;
  const isFull = available <= 0;

  return (
    <div className="card hover:border-zinc-600 transition-all hover:shadow-lg hover:shadow-black/40">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-white text-lg">{session.title}</h3>
        <span className={`badge ${typeColors[session.sessionType] || typeColors.general} capitalize`}>
          {session.sessionType}
        </span>
      </div>

      <p className="text-sm text-zinc-500 mb-4">{session.description}</p>

      <div className="space-y-2 text-sm text-zinc-400 mb-4">
        <div className="flex items-center gap-2">
          <User size={14} className="text-cyan-400" />
          <span>{session.trainer}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-cyan-400" />
          <span>{new Date(session.date).toDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-cyan-400" />
          <span>{session.startTime} – {session.endTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-cyan-400" />
          <span>{session.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-cyan-400" />
          <span className={isFull ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
            {isFull ? 'Fully Booked' : `${available} spots left`}
          </span>
        </div>
      </div>

      {onBook && (
        <button
          onClick={() => onBook(session.id)}
          disabled={booked || waitlisted || loading}
          className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
            booked
              ? 'bg-emerald-500/10 text-emerald-400 cursor-default border border-emerald-500/20'
              : waitlisted
              ? 'bg-yellow-500/10 text-yellow-400 cursor-default border border-yellow-500/20'
              : isFull
              ? 'btn-primary opacity-80'
              : 'btn-primary'
          }`}
        >
          {booked ? '✓ Booked' : waitlisted ? '⏳ On Waitlist' : loading ? 'Processing...' : isFull ? 'Join Waitlist' : 'Book Session'}
        </button>
      )}
    </div>
  );
}
