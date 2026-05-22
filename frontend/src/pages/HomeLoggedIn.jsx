import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Apple, Calendar, Zap, Shield, Users, Star, LayoutDashboard, BookOpen } from 'lucide-react';

const memberFeatures = [
  { icon: Dumbbell, title: 'Your Workout Plan', desc: 'View your personalized workout schedule assigned by your trainer.', color: 'text-cyan-400', link: '/dashboard' },
  { icon: Apple, title: 'Your Diet Plan', desc: 'Check your custom meal plan to fuel your fitness journey.', color: 'text-emerald-400', link: '/dashboard' },
  { icon: Calendar, title: 'Book Sessions', desc: 'Browse and book upcoming group training sessions with certified trainers.', color: 'text-blue-400', link: '/sessions' },
  { icon: BookOpen, title: 'Booking History', desc: 'View and manage all your past and upcoming session bookings.', color: 'text-purple-400', link: '/bookings' },
  { icon: Zap, title: 'Notifications', desc: 'Stay updated with session alerts and booking confirmations.', color: 'text-yellow-400', link: '/dashboard' },
  { icon: Users, title: 'Expert Trainers', desc: 'Train with certified professionals who guide you every step of the way.', color: 'text-pink-400', link: '/sessions' },
];

const adminFeatures = [
  { icon: LayoutDashboard, title: 'Dashboard', desc: 'View gym stats, recent bookings, and upcoming sessions at a glance.', color: 'text-cyan-400', link: '/admin/dashboard' },
  { icon: Users, title: 'Manage Members', desc: 'View, edit, and assign plans to all registered gym members.', color: 'text-emerald-400', link: '/admin/members' },
  { icon: Calendar, title: 'Manage Sessions', desc: 'Create and manage group training sessions for members to book.', color: 'text-blue-400', link: '/admin/sessions' },
  { icon: Dumbbell, title: 'Workout Plans', desc: 'Create and manage personalized workout plans for members.', color: 'text-purple-400', link: '/admin/workout-plans' },
  { icon: Apple, title: 'Diet Plans', desc: 'Build and assign nutrition plans tailored to member goals.', color: 'text-yellow-400', link: '/admin/diet-plans' },
  { icon: Zap, title: 'Send Notifications', desc: 'Broadcast announcements and alerts to all or specific members.', color: 'text-pink-400', link: '/admin/notifications' },
];

const stats = [
  { value: '500+', label: 'Active Members' },
  { value: '20+', label: 'Expert Trainers' },
  { value: '50+', label: 'Weekly Sessions' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function HomeLoggedIn() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const features = isAdmin ? adminFeatures : memberFeatures;
  const dashboardLink = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="bg-zinc-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-black via-zinc-900 to-black text-white py-24 px-4 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star size={14} /> Welcome back to PY Fitness
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white">
            Welcome back,<br />
            <span className="text-cyan-400">{user?.name}! 💪</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            {isAdmin
              ? 'Manage your gym, members, sessions, and plans all from one place.'
              : 'Your fitness journey continues. Check your plans, book sessions, and stay on track.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={dashboardLink} className="btn-primary text-lg px-8 py-4">
              Go to Dashboard →
            </Link>
            {!isAdmin && (
              <Link to="/sessions" className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors">
                Browse Sessions
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-cyan-500 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-black">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold">{s.value}</p>
              <p className="text-black/70 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4">
              {isAdmin ? 'Admin Controls' : 'Your Fitness Tools'}
            </h2>
            <p className="text-zinc-500 text-lg">
              {isAdmin ? 'Everything you need to run your gym efficiently.' : 'Everything you need to crush your fitness goals.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <Link key={f.title} to={f.link} className="card hover:border-zinc-600 transition-all hover:shadow-lg hover:shadow-black/40 group">
                <f.icon size={32} className={`${f.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-black text-white text-center border-t border-zinc-800">
        <h2 className="text-4xl font-bold mb-4">
          {isAdmin ? 'Ready to manage your gym?' : 'Ready to train today?'}
        </h2>
        <p className="text-zinc-500 text-lg mb-8">
          {isAdmin ? 'Head to your dashboard for a full overview.' : 'Book a session and keep pushing your limits.'}
        </p>
        <Link to={dashboardLink} className="btn-primary text-lg px-10 py-4">
          {isAdmin ? 'Go to Admin Dashboard' : 'Go to My Dashboard'}
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-black text-zinc-600 text-center py-6 text-sm border-t border-zinc-800">
        © 2024 PY Fitness Gym Management System. Built for university capstone demonstration.
      </footer>
    </div>
  );
}
