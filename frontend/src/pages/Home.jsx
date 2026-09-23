import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Zap, Apple, Calendar, Shield, Users, Star } from 'lucide-react';

const features = [
  { icon: Dumbbell, title: 'Personalized Workouts', desc: 'Custom workout plans tailored to your fitness goals and experience level.', color: 'text-cyan-400' },
  { icon: Apple, title: 'Diet & Nutrition Plans', desc: 'Expert-crafted meal plans to fuel your performance and reach your goals.', color: 'text-emerald-400' },
  { icon: Calendar, title: 'Session Booking', desc: 'Book group training sessions with certified trainers at your convenience.', color: 'text-blue-400' },
  { icon: Zap, title: 'Real-time Notifications', desc: 'Stay updated with session reminders and booking confirmations instantly.', color: 'text-yellow-400' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected with industry-standard JWT authentication.', color: 'text-purple-400' },
  { icon: Users, title: 'Expert Trainers', desc: 'Train with certified professionals who guide you every step of the way.', color: 'text-pink-400' },
];

const stats = [
  { value: '500+', label: 'Active Members' },
  { value: '20+', label: 'Expert Trainers' },
  { value: '50+', label: 'Weekly Sessions' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function Home() {
  return (
    <div className="bg-zinc-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-black via-zinc-900 to-black text-white py-24 px-4 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star size={14} /> #1 Gym Management Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white">
            Transform Your Body,<br />
            <span className="text-cyan-400">Transform Your Life</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            PY Fitness gives you personalized workout plans, expert diet guidance, and easy session booking — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Start Your Journey →
            </Link>
            <Link to="/login" className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors">
              Sign In
            </Link>
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
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-zinc-500 text-lg">A complete gym management solution for members and administrators.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="card hover:border-zinc-600 transition-all hover:shadow-lg hover:shadow-black/40">
                <f.icon size={32} className={`${f.color} mb-4`} />
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-black text-white text-center border-t border-zinc-800">
        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-zinc-500 text-lg mb-8">Join hundreds of members already achieving their fitness goals.</p>
        <Link to="/register" className="btn-primary text-lg px-10 py-4">
          Join PY Fitness Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-black text-zinc-600 text-center py-6 text-sm border-t border-zinc-800">
        © {new Date().getFullYear()} PY Fitness Gym Management System. Built for university capstone demonstration.
      </footer>
    </div>
  );
}
