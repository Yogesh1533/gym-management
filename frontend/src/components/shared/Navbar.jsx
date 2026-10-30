import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { Bell, Menu, X, LogOut } from 'lucide-react';
import Logo from './Logo';

const publicLinks = [
  { href: '/#schedule', label: 'Schedule' },
  { href: '/#coaches', label: 'Coaches' },
  { to: '/pricing', label: 'Membership' },
];

const memberLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sessions', label: 'Classes' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/progress', label: 'Progress' },
  { to: '/pricing', label: 'Membership' },
];

const timeAgo = (date) => {
  const mins = Math.round((Date.now() - new Date(date)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

const linkClass = ({ isActive }) =>
  `relative px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}`;

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
    setMenuOpen(false);
  }, [user, location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const links = !user ? publicLinks : isAdmin ? [{ to: '/admin/dashboard', label: 'Admin' }] : memberLinks;

  const renderLink = (l, mobile = false) => l.href ? (
    <a key={l.label} href={l.href} className={mobile ? 'block rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-white/5' : 'px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors'}>
      {l.label}
    </a>
  ) : (
    <NavLink key={l.label} to={l.to} end className={mobile
      ? ({ isActive }) => `block rounded-lg px-3 py-2.5 ${isActive ? 'bg-white/5 text-white' : 'text-zinc-300 hover:bg-white/5'}`
      : linkClass}>
      {({ isActive }) => (
        <>
          {l.label}
          {!mobile && isActive && <span className="absolute inset-x-3 -bottom-[17px] h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />}
        </>
      )}
    </NavLink>
  );

  return (
    <nav className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
      scrolled || menuOpen ? 'border-white/[0.07] bg-ink-950/80 backdrop-blur-xl' : 'border-transparent bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => renderLink(l))}
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Join now</Link>
              </div>
            ) : (
              <>
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative btn-ghost p-2"
                    aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-brand-400 text-ink-950 text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-2xl backdrop-blur-xl animate-fade-up">
                      <div className="flex items-center justify-between px-4 py-3 border-b hairline">
                        <span className="font-display text-sm font-semibold text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-brand-300 hover:text-brand-200">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-zinc-500 text-sm py-10">You're all caught up.</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="flex gap-3 px-4 py-3 border-b hairline last:border-0">
                              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-brand-400'}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">{n.title}</p>
                                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[11px] text-zinc-600 mt-1">{timeAgo(n.createdAt)}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link to={isAdmin ? '/admin/dashboard' : '/profile'} className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 hover:border-white/20 transition-colors">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-ink-950 flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm text-zinc-200 max-w-[8rem] truncate">{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="hidden md:inline-flex btn-ghost p-2 hover:text-rose-400" aria-label="Log out">
                  <LogOut size={17} />
                </button>
              </>
            )}

            <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t hairline px-4 py-4 space-y-1">
          {links.map(l => renderLink(l, true))}
          {!user ? (
            <div className="grid grid-cols-2 gap-2 pt-3">
              <Link to="/login" className="btn-secondary">Sign in</Link>
              <Link to="/register" className="btn-primary">Join now</Link>
            </div>
          ) : (
            <>
              {!isAdmin && <NavLink to="/profile" className="block rounded-lg px-3 py-2.5 text-zinc-300 hover:bg-white/5">Profile & billing</NavLink>}
              <button onClick={handleLogout} className="block w-full text-left rounded-lg px-3 py-2.5 text-rose-400 hover:bg-white/5">Log out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
