import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { sanitizeObject } from '../../utils/sanitize';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthShell from '../../components/auth/AuthShell';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    age: '', weight: '', height: '', fitnessGoal: 'general_fitness'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planId = params.get('plan');

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.register(sanitizeObject(form));
      login(data.token, data.user);
      toast.success('Account created. Welcome to PY Fitness!');
      // Continue to checkout when they arrived from a plan on the pricing page
      navigate(planId && /^\d+$/.test(planId) ? `/checkout/${planId}` : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell wide title="Create your account" subtitle={planId ? 'One step before checkout.' : 'Takes less than a minute. Add your stats now or later.'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="r-name">Full name</label>
            <input id="r-name" className="input" placeholder="John Smith" value={form.name} onChange={set('name')} required maxLength={100} autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="r-email">Email</label>
            <input id="r-email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="r-pass">Password</label>
            <input id="r-pass" type="password" className="input" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required minLength={6} autoComplete="new-password" />
          </div>
        </div>

        <fieldset className="rounded-2xl border hairline p-4">
          <legend className="px-2 text-xs font-medium uppercase tracking-wider text-zinc-500">About you · optional</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-4">
              <label className="label" htmlFor="r-goal">Fitness goal</label>
              <select id="r-goal" className="input" value={form.fitnessGoal} onChange={set('fitnessGoal')}>
                <option value="general_fitness">General fitness</option>
                <option value="weight_loss">Weight loss</option>
                <option value="muscle_gain">Muscle gain</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="r-age">Age</label>
              <input id="r-age" type="number" className="input" placeholder="25" value={form.age} onChange={set('age')} min={10} max={100} />
            </div>
            <div>
              <label className="label" htmlFor="r-weight">Weight kg</label>
              <input id="r-weight" type="number" className="input" placeholder="70" value={form.weight} onChange={set('weight')} min={20} max={500} step="0.1" />
            </div>
            <div>
              <label className="label" htmlFor="r-height">Height cm</label>
              <input id="r-height" type="number" className="input" placeholder="175" value={form.height} onChange={set('height')} min={50} max={300} />
            </div>
            <div>
              <label className="label" htmlFor="r-phone">Phone</label>
              <input id="r-phone" className="input" placeholder="0400…" value={form.phone} onChange={set('phone')} autoComplete="tel" />
            </div>
          </div>
        </fieldset>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Creating account…' : <>{planId ? 'Continue to checkout' : 'Create account'} <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Already a member?{' '}
        <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">Sign in</Link>
      </p>
    </AuthShell>
  );
}
