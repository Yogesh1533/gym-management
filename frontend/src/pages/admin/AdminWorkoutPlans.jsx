import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import Modal from '../../components/shared/Modal';
import { Plus, Edit, Trash2, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

// Mirror of backend ALL_DAYS — all possible days per goal
const ALL_DAYS = {
  weight_loss: [
    { day: 'Monday',    focus: 'Cardio + Upper Body', exercises: [
      { name: 'Treadmill Run', sets: 1, reps: '1', duration: '20 mins', notes: 'Moderate pace' },
      { name: 'Push-ups', sets: 3, reps: '12' },
      { name: 'Dumbbell Rows', sets: 3, reps: '12', notes: '8-10kg each side' },
      { name: 'Shoulder Press', sets: 3, reps: '10', notes: '8kg dumbbells' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12' },
    ]},
    { day: 'Tuesday',   focus: 'HIIT Circuit', exercises: [
      { name: 'Jumping Jacks', sets: 4, reps: '30', duration: '30 seconds' },
      { name: 'Burpees', sets: 4, reps: '10' },
      { name: 'Mountain Climbers', sets: 4, reps: '20', duration: '30 seconds' },
      { name: 'High Knees', sets: 4, reps: '30', duration: '30 seconds' },
      { name: 'Jump Squats', sets: 3, reps: '15' },
    ]},
    { day: 'Wednesday', focus: 'Active Recovery', exercises: [
      { name: 'Brisk Walking', sets: 1, reps: '1', duration: '30 mins' },
      { name: 'Full Body Stretch', sets: 3, reps: '1', duration: '15 mins' },
    ]},
    { day: 'Thursday',  focus: 'Lower Body', exercises: [
      { name: 'Squats', sets: 4, reps: '15' },
      { name: 'Lunges', sets: 3, reps: '12 each leg' },
      { name: 'Leg Press', sets: 3, reps: '15', notes: 'Moderate weight' },
      { name: 'Glute Bridges', sets: 3, reps: '20' },
      { name: 'Calf Raises', sets: 3, reps: '20' },
    ]},
    { day: 'Friday',    focus: 'Full Body Circuit', exercises: [
      { name: 'Kettlebell Swings', sets: 4, reps: '15', notes: '12-16kg' },
      { name: 'Box Jumps', sets: 3, reps: '10' },
      { name: 'Plank', sets: 3, reps: '1', duration: '45 seconds' },
      { name: 'Battle Ropes', sets: 3, reps: '1', duration: '30 seconds' },
      { name: 'Bicycle Crunches', sets: 3, reps: '20' },
    ]},
    { day: 'Saturday',  focus: 'Steady Cardio', exercises: [
      { name: 'Cycling or Swimming', sets: 1, reps: '1', duration: '40 mins', notes: 'Steady state' },
    ]},
  ],
  muscle_gain: [
    { day: 'Monday',    focus: 'Chest & Triceps', exercises: [
      { name: 'Bench Press', sets: 4, reps: '8-10', notes: 'Progressive overload' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10', notes: '15-20kg' },
      { name: 'Cable Flyes', sets: 3, reps: '12' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12' },
      { name: 'Skull Crushers', sets: 3, reps: '10', notes: 'EZ bar' },
    ]},
    { day: 'Tuesday',   focus: 'Back & Biceps', exercises: [
      { name: 'Deadlift', sets: 4, reps: '6-8', notes: 'Heavy, progressive' },
      { name: 'Pull-ups', sets: 4, reps: '8', notes: 'Add weight if easy' },
      { name: 'Barbell Row', sets: 3, reps: '10' },
      { name: 'Barbell Curl', sets: 3, reps: '10' },
      { name: 'Hammer Curls', sets: 3, reps: '12', notes: '10-12kg' },
    ]},
    { day: 'Wednesday', focus: 'Rest / Light Cardio', exercises: [
      { name: 'Walking', sets: 1, reps: '1', duration: '20 mins' },
      { name: 'Foam Rolling', sets: 1, reps: '1', duration: '10 mins' },
    ]},
    { day: 'Thursday',  focus: 'Shoulders & Abs', exercises: [
      { name: 'Overhead Press', sets: 4, reps: '8-10' },
      { name: 'Lateral Raises', sets: 3, reps: '15', notes: '8-10kg' },
      { name: 'Face Pulls', sets: 3, reps: '15' },
      { name: 'Weighted Crunches', sets: 3, reps: '15' },
      { name: 'Hanging Leg Raises', sets: 3, reps: '12' },
    ]},
    { day: 'Friday',    focus: 'Legs', exercises: [
      { name: 'Barbell Squat', sets: 4, reps: '8', notes: 'Progressive overload' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10' },
      { name: 'Leg Press', sets: 3, reps: '12' },
      { name: 'Leg Curl', sets: 3, reps: '12' },
      { name: 'Calf Raises', sets: 4, reps: '15', notes: 'Weighted' },
    ]},
    { day: 'Saturday',  focus: 'Arms & Weak Points', exercises: [
      { name: 'Preacher Curl', sets: 3, reps: '10' },
      { name: 'Tricep Dips', sets: 3, reps: '12', notes: 'Add weight if easy' },
      { name: 'Concentration Curl', sets: 3, reps: '12' },
      { name: 'Overhead Tricep Ext', sets: 3, reps: '12' },
    ]},
  ],
  endurance: [
    { day: 'Monday',    focus: 'Long Run', exercises: [
      { name: 'Outdoor Run', sets: 1, reps: '1', duration: '30-45 mins', notes: 'Conversational pace' },
    ]},
    { day: 'Tuesday',   focus: 'Cross Training + Core', exercises: [
      { name: 'Cycling', sets: 1, reps: '1', duration: '40 mins' },
      { name: 'Plank', sets: 3, reps: '1', duration: '60 seconds' },
      { name: 'Bicycle Crunches', sets: 3, reps: '20' },
      { name: 'Leg Raises', sets: 3, reps: '15' },
    ]},
    { day: 'Wednesday', focus: 'Interval Training', exercises: [
      { name: 'Sprint Intervals', sets: 8, reps: '1', duration: '30s on / 90s off' },
      { name: 'Cool Down Walk', sets: 1, reps: '1', duration: '10 mins' },
    ]},
    { day: 'Thursday',  focus: 'Strength + Cardio', exercises: [
      { name: 'Squats', sets: 3, reps: '15' },
      { name: 'Push-ups', sets: 3, reps: '15' },
      { name: 'Dumbbell Rows', sets: 3, reps: '12' },
      { name: 'Rowing Machine', sets: 1, reps: '1', duration: '20 mins' },
    ]},
    { day: 'Friday',    focus: 'Tempo Run', exercises: [
      { name: 'Tempo Run', sets: 1, reps: '1', duration: '25 mins', notes: 'Comfortably hard pace' },
    ]},
    { day: 'Saturday',  focus: 'Long Cardio', exercises: [
      { name: 'Cycling or Swimming', sets: 1, reps: '1', duration: '60 mins' },
    ]},
  ],
  general_fitness: [
    { day: 'Monday',    focus: 'Full Body Strength', exercises: [
      { name: 'Squats', sets: 3, reps: '12' },
      { name: 'Push-ups', sets: 3, reps: '10' },
      { name: 'Dumbbell Rows', sets: 3, reps: '12', notes: '8kg' },
      { name: 'Shoulder Press', sets: 3, reps: '10' },
      { name: 'Plank', sets: 3, reps: '1', duration: '30 seconds' },
    ]},
    { day: 'Tuesday',   focus: 'Cardio + Core', exercises: [
      { name: 'Treadmill Jog', sets: 1, reps: '1', duration: '25 mins' },
      { name: 'Bicycle Crunches', sets: 3, reps: '20' },
      { name: 'Russian Twists', sets: 3, reps: '15' },
      { name: 'Leg Raises', sets: 3, reps: '12' },
    ]},
    { day: 'Wednesday', focus: 'Active Recovery', exercises: [
      { name: 'Yoga / Stretching', sets: 1, reps: '1', duration: '30 mins' },
    ]},
    { day: 'Thursday',  focus: 'Lower Body', exercises: [
      { name: 'Lunges', sets: 3, reps: '10 each leg' },
      { name: 'Leg Press', sets: 3, reps: '12' },
      { name: 'Glute Bridges', sets: 3, reps: '15' },
      { name: 'Calf Raises', sets: 3, reps: '20' },
    ]},
    { day: 'Friday',    focus: 'Upper Body + Flexibility', exercises: [
      { name: 'Dumbbell Press', sets: 3, reps: '10' },
      { name: 'Lat Pulldown', sets: 3, reps: '12' },
      { name: 'Bicep Curls', sets: 3, reps: '12' },
      { name: 'Tricep Dips', sets: 3, reps: '10' },
      { name: 'Yoga Stretching', sets: 1, reps: '1', duration: '15 mins' },
    ]},
    { day: 'Saturday',  focus: 'Cardio + Fun', exercises: [
      { name: 'Swimming or Cycling', sets: 1, reps: '1', duration: '30 mins' },
    ]},
  ],
};

const EMPTY = { title: '', description: '', level: 'beginner', goal: 'general_fitness', durationWeeks: 4, gymDays: 3, schedule: [] };

const levelColors = {
  beginner:     'bg-emerald-500/10 text-emerald-400',
  intermediate: 'bg-yellow-500/10 text-yellow-400',
  advanced:     'bg-red-500/10 text-red-400',
};

export default function AdminWorkoutPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    adminAPI.getWorkoutPlans().then(res => setPlans(res.data)).finally(() => setLoading(false));
  }, []);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  // When goal or gymDays changes, auto-populate schedule
  const updateSchedule = (goal, gymDays) => {
    const days = Math.min(Math.max(parseInt(gymDays) || 3, 2), 6);
    const allDays = ALL_DAYS[goal] || ALL_DAYS.general_fitness;
    return allDays.slice(0, days);
  };

  const handleGoalChange = (e) => {
    const goal = e.target.value;
    const schedule = updateSchedule(goal, form.gymDays);
    setForm({ ...form, goal, schedule });
  };

  const handleGymDaysChange = (days) => {
    const schedule = updateSchedule(form.goal, days);
    setForm({ ...form, gymDays: days, schedule });
  };

  const openCreate = () => {
    const schedule = updateSchedule('general_fitness', 3);
    setForm({ ...EMPTY, schedule });
    setEditing(null);
    setModal(true);
  };

  const openEdit = (p) => {
    setForm({ ...p, gymDays: p.schedule?.length || 3 });
    setEditing(p.id);
    setModal(true);
  };

  // Edit exercise field inline
  const updateExercise = (dayIdx, exIdx, field, value) => {
    const schedule = form.schedule.map((day, di) => {
      if (di !== dayIdx) return day;
      return {
        ...day,
        exercises: day.exercises.map((ex, ei) =>
          ei === exIdx ? { ...ex, [field]: value } : ex
        )
      };
    });
    setForm({ ...form, schedule });
  };

  const addExercise = (dayIdx) => {
    const schedule = form.schedule.map((day, di) =>
      di === dayIdx
        ? { ...day, exercises: [...day.exercises, { name: '', sets: 3, reps: '10', notes: '' }] }
        : day
    );
    setForm({ ...form, schedule });
  };

  const removeExercise = (dayIdx, exIdx) => {
    const schedule = form.schedule.map((day, di) =>
      di === dayIdx
        ? { ...day, exercises: day.exercises.filter((_, ei) => ei !== exIdx) }
        : day
    );
    setForm({ ...form, schedule });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await adminAPI.updateWorkoutPlan(editing, form);
        setPlans(prev => prev.map(p => p.id === editing ? data : p));
        toast.success('Plan updated!');
      } else {
        const { data } = await adminAPI.createWorkoutPlan(form);
        setPlans(prev => [data, ...prev]);
        toast.success('Workout plan created!');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout plan?')) return;
    try {
      await adminAPI.deleteWorkoutPlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plan deleted');
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Workout Plans</h1>
          <p className="text-zinc-500 mt-1">{plans.length} plans available</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Plan
        </button>
      </div>

      <div className="space-y-4">
        {plans.map(p => (
          <div key={p.id} className="card">
            {/* Plan Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-white text-lg">{p.title}</h3>
                  <span className={`badge ${levelColors[p.level]} capitalize text-xs`}>{p.level}</span>
                  <span className="badge bg-brand-500/10 text-brand-400 text-xs capitalize">{p.goal?.replace(/_/g, ' ')}</span>
                  <span className="badge bg-white/10 text-zinc-300 text-xs">{p.durationWeeks} weeks</span>
                  <span className="badge bg-blue-500/10 text-blue-400 text-xs">{p.schedule?.length || 0} days/week</span>
                </div>
                <p className="text-sm text-zinc-500 mt-1">{p.description}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setExpandedPlan(expandedPlan === p.id ? null : p.id)}
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                >
                  {expandedPlan === p.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Edit size={15} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Expanded Schedule */}
            {expandedPlan === p.id && p.schedule?.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-white/[0.07] pt-4">
                {p.schedule.map((day, di) => (
                  <div key={di} className="bg-white/[0.04] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedDay(expandedDay === `${p.id}-${di}` ? null : `${p.id}-${di}`)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white">{day.day}</span>
                        <span className="text-xs text-zinc-400 bg-white/10 px-2 py-0.5 rounded-full">{day.focus}</span>
                        <span className="text-xs text-zinc-500">{day.exercises?.length} exercises</span>
                      </div>
                      {expandedDay === `${p.id}-${di}` ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
                    </button>
                    {expandedDay === `${p.id}-${di}` && (
                      <div className="px-4 pb-3 space-y-2 border-t border-white/10">
                        {day.exercises?.map((ex, ei) => (
                          <div key={ei} className="flex items-center justify-between text-sm py-1.5 border-b border-white/10 last:border-0">
                            <span className="text-white font-medium w-40">{ex.name}</span>
                            <span className="text-brand-400 text-xs">
                              {ex.duration ? ex.duration : `${ex.sets} sets × ${ex.reps} reps`}
                            </span>
                            {ex.notes && <span className="text-zinc-500 text-xs italic">{ex.notes}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <Dumbbell size={48} className="mx-auto mb-3 opacity-30" />
            <p>No workout plans yet. Create one!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Workout Plan' : 'Create Workout Plan'} size="xl">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={set('title')} required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={set('description')} />
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={form.level} onChange={set('level')}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="label">Goal</label>
              <select className="input" value={form.goal} onChange={handleGoalChange}>
                <option value="general_fitness">General Fitness</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="label">Duration (weeks)</label>
              <input type="number" className="input" value={form.durationWeeks} onChange={set('durationWeeks')} min={1} />
            </div>
            <div>
              <label className="label">Gym Days Per Week</label>
              <div className="flex gap-2 mt-1">
                {[2,3,4,5,6].map(d => (
                  <button
                    key={d} type="button"
                    onClick={() => handleGymDaysChange(d)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                      form.gymDays === d ? 'bg-brand-500 text-black' : 'bg-white/10 text-zinc-400 hover:bg-zinc-600'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Editor */}
          {form.schedule?.length > 0 && (
            <div>
              <label className="label">Weekly Schedule ({form.schedule.length} days)</label>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {form.schedule.map((day, di) => (
                  <div key={di} className="bg-white/[0.04] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                      <span className="font-semibold text-white text-sm">{day.day}</span>
                      <span className="text-xs text-zinc-400">{day.focus}</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {day.exercises.map((ex, ei) => (
                        <div key={ei} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            className="input text-xs col-span-4" placeholder="Exercise name"
                            value={ex.name}
                            onChange={e => updateExercise(di, ei, 'name', e.target.value)}
                          />
                          <input
                            className="input text-xs col-span-2" placeholder="Sets" type="number"
                            value={ex.sets}
                            onChange={e => updateExercise(di, ei, 'sets', e.target.value)}
                          />
                          <input
                            className="input text-xs col-span-2" placeholder="Reps"
                            value={ex.reps}
                            onChange={e => updateExercise(di, ei, 'reps', e.target.value)}
                          />
                          <input
                            className="input text-xs col-span-3" placeholder="Notes"
                            value={ex.notes || ''}
                            onChange={e => updateExercise(di, ei, 'notes', e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeExercise(di, ei)}
                            className="col-span-1 text-red-400 hover:text-red-300 text-xs text-center"
                          >✕</button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addExercise(di)}
                        className="text-xs text-brand-400 hover:underline mt-1"
                      >
                        + Add Exercise
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Update Plan' : 'Create Plan'}
            </button>
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
