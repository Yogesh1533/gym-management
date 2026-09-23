import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import { Users, Calendar, Dumbbell, Apple, BookOpen, TrendingUp } from 'lucide-react';
import { formatShortDate } from '../../utils/date';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-zinc-500 mt-1">Overview of your gym operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Members" value={stats.totalMembers} icon={Users} color="orange" />
        <StatCard title="Sessions" value={stats.totalSessions} icon={Calendar} color="blue" />
        <StatCard title="Bookings" value={stats.totalBookings} icon={BookOpen} color="green" />
        <StatCard title="Workout Plans" value={stats.workoutPlans} icon={Dumbbell} color="purple" />
        <StatCard title="Diet Plans" value={stats.dietPlans} icon={Apple} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" /> Recent Bookings
          </h2>
          {stats.recentBookings.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-white text-sm">{b.member?.name}</p>
                    <p className="text-xs text-zinc-500">{b.session?.title}</p>
                  </div>
                  <span className="text-xs text-zinc-500">{formatShortDate(b.session?.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="card">
          <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" /> Upcoming Sessions
          </h2>
          {stats.upcomingSessions.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-6">No upcoming sessions.</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-white text-sm">{s.title}</p>
                    <p className="text-xs text-zinc-500">{s.trainer} · {s.startTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">{formatShortDate(s.date)}</p>
                    <p className="text-xs text-cyan-400">{s.totalSlots - s.bookedSlots} slots left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
