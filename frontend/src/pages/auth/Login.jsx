import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { sanitizeObject } from '../../utils/sanitize';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from '../../components/auth/AuthShell';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(sanitizeObject(form));
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      const from = location.state?.from;
      navigate(from || (data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@gym.com', password: 'admin123' });
    else setForm({ email: 'john@gym.com', password: 'member123' });
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to book classes and track your progress.">
      <div className="mb-6 rounded-xl border border-brand-400/20 bg-brand-400/5 p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-300"><Sparkles size={13} /> Try the demo</p>
        <div className="mt-2.5 flex gap-2">
          <button type="button" onClick={() => fillDemo('member')} className="btn-secondary px-3 py-1.5 text-xs">Member account</button>
          <button type="button" onClick={() => fillDemo('admin')} className="btn-secondary px-3 py-1.5 text-xs">Admin account</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" placeholder="you@example.com" autoComplete="email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input id="password" type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="••••••••" autoComplete="current-password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Signing in…' : <>Sign in <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500">
        New to PY Fitness?{' '}
        <Link to="/register" className="font-semibold text-brand-300 hover:text-brand-200">Create an account</Link>
      </p>
    </AuthShell>
  );
}
