import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { Bell, Dumbbell, Menu, X, LogOut, User, LayoutDashboard, TrendingUp } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount()
      ]);
      const data = notifRes.data;
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
      setUnreadCount(countRes.data.count);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const dashboardPath = isAdmin ? '/admin/dashboard' : '/dashboard';

  return (
    <nav className="bg-black border-b border-zinc-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Dumbbell className="text-cyan-400" size={28} />
            <span>PY <span className="text-cyan-400">Fitness</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                <Link to="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Join Now</Link>
              </>
            ) : (
              <>
                <Link to={dashboardPath} className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                {!isAdmin && (
                  <>
                    <Link to="/sessions" className="hover:text-cyan-400 transition-colors">Sessions</Link>
                    <Link to="/progress" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                      <TrendingUp size={16} /> Progress
                    </Link>
                    <Link to="/pricing" className="hover:text-cyan-400 transition-colors">Plans</Link>
                  </>
                )}

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-1 hover:text-cyan-400 transition-colors">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-cyan-500 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-zinc-900 text-gray-200 rounded-xl shadow-xl border border-zinc-700 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 bg-zinc-800">
                        <span className="font-semibold text-sm text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-cyan-400 hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto bg-zinc-900">
                        {notifications.length === 0 ? (
                          <p className="text-center text-zinc-500 text-sm py-6">No notifications</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`px-4 py-3 border-b border-zinc-800 last:border-0 ${!n.isRead ? 'bg-cyan-500/5' : ''}`}>
                              <p className="text-sm font-medium text-white">{n.title}</p>
                              <p className="text-xs text-zinc-400 mt-0.5">{n.message}</p>
                              <p className="text-xs text-zinc-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2 hover:text-cyan-400 transition-colors text-sm">
                    <div className="w-8 h-8 bg-cyan-500 text-black rounded-full flex items-center justify-center font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors text-sm">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 px-4 py-4 space-y-3">
          {!user ? (
            <>
              <Link to="/" className="block hover:text-cyan-400" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/pricing" className="block hover:text-cyan-400" onClick={() => setMenuOpen(false)}>Pricing</Link>
              <Link to="/login" className="block hover:text-cyan-400" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="block hover:text-cyan-400" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          ) : (
            <>
              <Link to={dashboardPath} className="block hover:text-cyan-400" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {!isAdmin && <Link to="/sessions" className="block hover:text-cyan-400" onClick={() => setMenuOpen(false)}>Sessions</Link>}
              {!isAdmin && <Link to="/progress" className="block hover:text-cyan-400" onClick={() => setMenuOpen(false)}>Progress</Link>}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-red-400">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
