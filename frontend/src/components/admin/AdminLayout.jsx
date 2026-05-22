import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Calendar, Dumbbell, Apple,
  BookOpen, Bell, LogOut, Menu, Dumbbell as GymIcon, CreditCard
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
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
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <GymIcon className="text-cyan-400" size={24} />
          PY <span className="text-cyan-400">Fitness</span>
          <span className="text-xs bg-cyan-500 text-black font-semibold px-2 py-0.5 rounded-full ml-1">Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-500 text-black'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-cyan-500 text-black rounded-full flex items-center justify-center font-bold text-sm">
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
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 flex-shrink-0">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-10">
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-400">
            <Menu size={22} />
          </button>
          <span className="font-bold text-white">PY Fitness Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
