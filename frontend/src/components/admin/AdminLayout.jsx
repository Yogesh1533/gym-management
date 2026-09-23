import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Calendar, Dumbbell, Apple,
  BookOpen, Bell, LogOut, Menu, CreditCard, Inbox, ExternalLink
} from 'lucide-react';
import Logo from '../shared/Logo';

const navItems = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/leads',        icon: Inbox,           label: 'Trial leads' },
  { to: '/admin/members',      icon: Users,           label: 'Members' },
  { to: '/admin/sessions',     icon: Calendar,        label: 'Sessions' },
  { to: '/admin/workout-plans',icon: Dumbbell,        label: 'Workout Plans' },
  { to: '/admin/diet-plans',   icon: Apple,           label: 'Diet Plans' },
  { to: '/admin/bookings',     icon: BookOpen,        label: 'Bookings' },
  { to: '/admin/memberships',  icon: CreditCard,      label: 'Memberships' },
  { to: '/admin/notifications',icon: Bell,            label: 'Notifications' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 flex items-center border-b hairline">
        <Logo to="/admin/dashboard" suffix="Admin" />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-500 text-black'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (<><Icon size={17} className={isActive ? 'text-brand-300' : ''} />{label}</>)}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t hairline">
        <a href="/" target="_blank" rel="noreferrer" className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 hover:text-white hover:bg-white/[0.03]">
          <ExternalLink size={14} /> View public site
        </a>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-ink-950 flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-zinc-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-500 hover:text-red-400 text-sm transition-colors w-full">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-ink-950 overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-ink-900/60 border-r hairline flex-shrink-0">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-ink-900 border-r border-white/[0.07] flex flex-col z-10">
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden bg-ink-900 border-b border-white/[0.07] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-400">
            <Menu size={22} />
          </button>
          <Logo to="/admin/dashboard" suffix="Admin" />
        </div>

        <main className="flex-1 overflow-y-auto bg-ink-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
