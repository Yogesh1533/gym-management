import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { sanitizeObject } from '../../utils/sanitize';
import { Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    age: '', weight: '', height: '', fitnessGoal: 'general_fitness'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.register(sanitizeObject(form));
      login(data.token, data.user);
      toast.success('Account created! Welcome to PY Fitness!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white text-3xl font-bold">
            <Dumbbell className="text-cyan-400" size={36} />
            PY <span className="text-cyan-400">Fitness</span>
          </div>
          <p className="text-zinc-500 mt-2">Create your membership account</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" placeholder="John Smith" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label className="label">Password *</label>
                <input type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input" placeholder="+1-555-0100" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" className="input" placeholder="25" value={form.age} onChange={set('age')} min={10} max={100} />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" className="input" placeholder="70" value={form.weight} onChange={set('weight')} />
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" className="input" placeholder="175" value={form.height} onChange={set('height')} />
              </div>
              <div>
                <label className="label">Fitness Goal</label>
                <select className="input" value={form.fitnessGoal} onChange={set('fitnessGoal')}>
                  <option value="general_fitness">General Fitness</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
