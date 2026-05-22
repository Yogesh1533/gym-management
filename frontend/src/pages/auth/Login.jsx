import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { sanitizeObject } from '../../utils/sanitize';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(sanitizeObject(form));
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white text-3xl font-bold">
            <Dumbbell className="text-cyan-400" size={36} />
            PY <span className="text-cyan-400">Fitness</span>
          </div>
          <p className="text-zinc-500 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
          {/* Demo Credentials */}
          <div className="mb-6 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <p className="text-xs font-semibold text-cyan-400 mb-2">🎯 Demo Credentials</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo('admin')} className="text-xs bg-cyan-500 text-black font-semibold px-3 py-1 rounded-lg hover:bg-cyan-400 transition-colors">
                Fill Admin
              </button>
              <button onClick={() => fillDemo('member')} className="text-xs bg-zinc-700 text-white px-3 py-1 rounded-lg hover:bg-zinc-600 transition-colors">
                Fill Member
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
