import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { TrendingDown, TrendingUp, Minus, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import Achievements from '../../components/member/Achievements';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Progress() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userAPI.getWeightLogs()
      .then(res => setLogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleLog = async (e) => {
    e.preventDefault();
    if (!weight) return;
    setSaving(true);
    try {
      const { data } = await userAPI.logWeight(parseFloat(weight), note);
      setLogs(prev => [...prev, data]);
      toast.success('Weight logged!');
      setWeight(''); setNote('');
    } catch (err) {
      toast.error('Failed to log weight');
    } finally {
      setSaving(false);
    }
  };

  const bmi = user.weight && user.height
    ? (user.weight / ((user.height / 100) ** 2)).toFixed(1)
    : null;

  const bmiCategory = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    : null;

  const bmiColor = bmi
    ? bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-emerald-400' : bmi < 30 ? 'text-yellow-400' : 'text-red-400'
    : '';

  const firstWeight = logs.length > 0 ? logs[0].weight : null;
  const lastWeight  = logs.length > 0 ? logs[logs.length - 1].weight : null;
  const diff = firstWeight && lastWeight ? parseFloat((lastWeight - firstWeight).toFixed(1)) : null;

  const chartData = {
    labels: logs.map(l => new Date(l.createdAt).toLocaleDateString()),
    datasets: [{
      label: 'Weight (kg)',
      data: logs.map(l => l.weight),
      borderColor: '#d9b465',
      backgroundColor: 'rgba(217,180,101,0.08)',
      pointBackgroundColor: '#d9b465',
      pointRadius: 5,
      tension: 0.4,
      fill: true,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        borderColor: '#3f3f46',
        borderWidth: 1,
      }
    },
    scales: {
      x: { ticks: { color: '#71717a' }, grid: { color: '#27272a' } },
      y: { ticks: { color: '#71717a' }, grid: { color: '#27272a' } },
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="page-title mb-2">Progress Tracker</h1>
      <p className="text-zinc-500 mb-8">Log your weight and track your fitness journey over time.</p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-zinc-500 text-xs mb-1">Current Weight</p>
          <p className="text-2xl font-bold text-white">{user.weight || '—'} <span className="text-sm text-zinc-500">kg</span></p>
        </div>
        <div className="card text-center">
          <p className="text-zinc-500 text-xs mb-1">BMI</p>
          <p className={`text-2xl font-bold ${bmiColor}`}>{bmi || '—'}</p>
          <p className={`text-xs ${bmiColor}`}>{bmiCategory}</p>
        </div>
        <div className="card text-center">
          <p className="text-zinc-500 text-xs mb-1">Total Change</p>
          {diff !== null ? (
            <div className="flex items-center justify-center gap-1">
              {diff < 0 ? <TrendingDown size={18} className="text-emerald-400" /> : diff > 0 ? <TrendingUp size={18} className="text-red-400" /> : <Minus size={18} className="text-zinc-400" />}
              <p className={`text-2xl font-bold ${diff < 0 ? 'text-emerald-400' : diff > 0 ? 'text-red-400' : 'text-zinc-400'}`}>{diff > 0 ? '+' : ''}{diff} kg</p>
            </div>
          ) : <p className="text-2xl font-bold text-zinc-500">—</p>}
        </div>
        <div className="card text-center">
          <p className="text-zinc-500 text-xs mb-1">Logs</p>
          <p className="text-2xl font-bold text-white">{logs.length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card mb-8">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Scale size={18} className="text-brand-400" /> Weight History</h2>
        {logs.length < 2 ? (
          <p className="text-zinc-500 text-sm text-center py-8">Log at least 2 entries to see your chart.</p>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

      {/* Log Form */}
      <div className="card mb-8">
        <h2 className="font-bold text-white mb-4">Log Today's Weight</h2>
        <form onSubmit={handleLog} className="flex gap-3 flex-wrap">
          <input
            type="number" step="0.1" min="20" max="300"
            className="input w-36" placeholder="e.g. 75.5"
            value={weight} onChange={e => setWeight(e.target.value)} required
          />
          <input
            className="input flex-1" placeholder="Optional note (e.g. after workout)"
            value={note} onChange={e => setNote(e.target.value)}
          />
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Log Weight'}
          </button>
        </form>
      </div>

      <div className="mb-8"><Achievements /></div>

      {/* Log History */}
      {logs.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-white mb-4">Log History</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...logs].reverse().map((log, i) => (
              <div key={log.id} className="flex items-center justify-between bg-white/[0.04] rounded-lg px-4 py-2 text-sm">
                <span className="text-zinc-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                <span className="text-white font-semibold">{log.weight} kg</span>
                <span className="text-zinc-500 text-xs">{log.note || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
