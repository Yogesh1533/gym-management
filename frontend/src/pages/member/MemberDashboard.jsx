import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI, sessionAPI, userAPI } from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import MembershipCard from '../../components/member/MembershipCard';
import { Sparkles, Calendar, Dumbbell, Apple, Clock, ChevronRight, ChevronDown, ChevronUp, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/date';
import Achievements from '../../components/member/Achievements';

const goalLabels = {
  weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain',
  endurance: 'Endurance', general_fitness: 'General Fitness'
};

const bmiColors = {
  underweight: 'text-blue-400',
  normal: 'text-emerald-400',
  overweight: 'text-yellow-400',
  obese: 'text-red-400'
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function MemberDashboard() {
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [gymDays, setGymDays] = useState(3);
  const [foods, setFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [customGenerating, setCustomGenerating] = useState(false);

  useEffect(() => {
    Promise.all([bookingAPI.getMyBookings(), sessionAPI.getUpcoming(), userAPI.getFoods()])
      .then(([b, s, f]) => { setBookings(b.data); setSessions(s.data); setFoods(f.data); })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed' && String(b.session?.date) >= today)
    .sort((a, b) => String(a.session?.date).localeCompare(String(b.session?.date)))
    .slice(0, 3);
  const bookedSessionIds = new Set(bookings.filter(b => b.status !== 'cancelled').map(b => b.sessionId));
  const attendedCount = bookings.filter(b => b.status === 'attended').length;
  const streak = bookings.filter(b => b.status === 'attended' || b.status === 'confirmed').length;

  const bmi = user.weight && user.height
    ? parseFloat((user.weight / ((user.height / 100) ** 2)).toFixed(1))
    : null;

  const bmiCategory = bmi
    ? bmi < 18.5 ? 'underweight' : bmi < 25 ? 'normal' : bmi < 30 ? 'overweight' : 'obese'
    : null;

  const handleGeneratePlan = async () => {
    if (!user.weight || !user.height || !user.age)
      return toast.error('Please update your weight, height, and age in Profile first.');
    setGenerating(true);
    try {
      const { data } = await userAPI.generatePlan(gymDays);
      const profileRes = await userAPI.getProfile();
      updateUser({ ...user, ...profileRes.data });
      toast.success(`Plan generated! Your BMI is ${data.bmi} (${data.bmiCategory})`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFood = (id) => setSelectedFoods(prev =>
    prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
  );

  const handleCustomPlan = async () => {
    if (!user.weight || !user.height || !user.age)
      return toast.error('Please update your weight, height, and age in Profile first.');
    if (selectedFoods.length === 0)
      return toast.error('Please select at least one food.');
    setCustomGenerating(true);
    try {
      await userAPI.generateCustomPlan(selectedFoods);
      const profileRes = await userAPI.getProfile();
      updateUser({ ...user, ...profileRes.data });
      toast.success('Custom diet plan created!');
      setShowFoodSelector(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create custom plan');
    } finally {
      setCustomGenerating(false);
    }
  };

  const foodCategories = [...new Set(foods.map(f => f.category))];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-brand-400/[0.12] via-ink-850 to-ink-900 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-grid opacity-50 mask-fade-b" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-400/15 blur-3xl" />
        <div className="relative">
          <p className="eyebrow">{greeting()}</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-white">{user.name.split(' ')[0]}, let's get to work.</h1>
          <p className="text-zinc-400 mt-2">Goal: <span className="text-brand-300 font-medium">{goalLabels[user.fitnessGoal]}</span></p>
          <div className="flex items-center gap-2 text-xs mt-4 flex-wrap">
            {user.weight && <span className="badge bg-white/5 text-zinc-300 ring-1 ring-white/10">{user.weight} kg</span>}
            {user.height && <span className="badge bg-white/5 text-zinc-300 ring-1 ring-white/10">{user.height} cm</span>}
            {user.age && <span className="badge bg-white/5 text-zinc-300 ring-1 ring-white/10">{user.age} yrs</span>}
            {bmi && (
              <span className={`badge bg-white/5 ring-1 ring-white/10 font-semibold ${bmiColors[bmiCategory]}`}>
                BMI {bmi} · {bmiCategory}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleGeneratePlan}
          disabled={generating}
          className="relative btn-primary px-5 py-3 text-sm whitespace-nowrap"
        >
          <Sparkles size={16} /> {generating ? 'Generating…' : 'Generate My Plan'}
        </button>
      </div>

      {/* Gym Days Selector */}
      <div className="flex items-center gap-3 mb-4 bg-ink-900 border border-white/[0.07] rounded-xl px-5 py-4">
        <span className="text-zinc-400 text-sm font-medium">How many days can you come to the gym per week?</span>
        <div className="flex gap-2">
          {[2,3,4,5,6].map(d => (
            <button
              key={d}
              onClick={() => setGymDays(d)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                gymDays === d ? 'bg-brand-500 text-black' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/10'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <span className="text-zinc-500 text-xs">days/week</span>
      </div>

      {/* Custom Diet Plan — Food Selector */}
      <div className="mb-8 bg-ink-900 border border-white/[0.07] rounded-xl overflow-hidden">
        <button
          onClick={() => setShowFoodSelector(!showFoodSelector)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <span className="text-white font-medium">🥗 Build Custom Diet from My Foods</span>
            <span className="text-zinc-500 text-xs ml-3">{selectedFoods.length} food{selectedFoods.length !== 1 ? 's' : ''} selected</span>
          </div>
          {showFoodSelector ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
        </button>

        {showFoodSelector && (
          <div className="px-5 pb-5 border-t border-white/[0.07]">
            <p className="text-zinc-500 text-xs mt-3 mb-4">Select the foods you have available. We'll build a diet plan using only those foods with proper macro breakdown.</p>
            {foodCategories.map(cat => (
              <div key={cat} className="mb-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {foods.filter(f => f.category === cat).map(food => {
                    const selected = selectedFoods.includes(food.id);
                    return (
                      <button
                        key={food.id}
                        onClick={() => toggleFood(food.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          selected
                            ? 'bg-brand-500 text-black border-brand-500'
                            : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:border-zinc-500'
                        }`}
                      >
                        {food.name}
                        <span className="ml-1 opacity-60">{food.per100g.calories}kcal/100g</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.07]">
              <button
                onClick={handleCustomPlan}
                disabled={customGenerating || selectedFoods.length === 0}
                className="btn-primary text-sm px-5 py-2"
              >
                {customGenerating ? '⏳ Building...' : '🥗 Generate Custom Diet Plan'}
              </button>
              <button onClick={() => setSelectedFoods([])} className="text-xs text-zinc-500 hover:text-zinc-300">
                Clear selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total bookings" value={bookings.filter(b => b.status !== 'cancelled').length} icon={Calendar} color="brand" />
        <StatCard title="Upcoming" value={upcomingBookings.length} icon={Clock} color="blue" />
        <StatCard title="Attended" value={attendedCount} icon={Target} color="green" />
        <StatCard title="Workout plan" value={user.workoutPlan ? 'Active' : 'Pending'} icon={Dumbbell} color="orange" subtitle={user.workoutPlan?.title} />
        <StatCard title="Diet plan" value={user.dietPlan ? 'Active' : 'Pending'} icon={Apple} color="purple" subtitle={user.dietPlan ? `${user.dietPlan.dailyCalories || '—'} kcal / day` : undefined} />
      </div>

      <div className="mb-8"><Achievements compact /></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Plan */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2"><Dumbbell size={18} className="text-brand-400" /> Workout Plan</h2>
          </div>
          {user.workoutPlan ? (
            <div>
              <p className="font-semibold text-white">{user.workoutPlan.title}</p>
              <p className="text-sm text-zinc-500 mt-1">{user.workoutPlan.description}</p>
              <div className="flex gap-2 mt-3">
                <span className="badge bg-brand-500/10 text-brand-400 capitalize">{user.workoutPlan.level}</span>
                <span className="badge bg-blue-500/10 text-blue-400">{user.workoutPlan.durationWeeks} weeks</span>
              </div>
              {user.workoutPlan.schedule?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">This Week</p>
                  {user.workoutPlan.schedule.map((day, i) => (
                    <div key={i} className="bg-white/[0.04] rounded-lg px-3 py-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-white">{day.day}</span>
                        <span className="text-zinc-400 text-xs">{day.focus}</span>
                      </div>
                      {day.exercises?.map((ex, j) => (
                        <div key={j} className="flex justify-between text-xs text-zinc-400 pl-2 border-l border-white/10 mt-1">
                          <span className="text-zinc-300">{ex.name}</span>
                          <span className="text-brand-400">
                            {ex.duration ? ex.duration : `${ex.sets} x ${ex.reps}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-600">
              <Dumbbell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No workout plan yet.</p>
              <button onClick={handleGeneratePlan} disabled={generating} className="text-xs text-brand-400 hover:underline mt-1">
                Generate one now →
              </button>
            </div>
          )}
        </div>

        {/* Diet Plan */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2"><Apple size={18} className="text-emerald-400" /> Diet Plan</h2>
          </div>
          {user.dietPlan ? (
            <div>
              <p className="font-semibold text-white">{user.dietPlan.title}</p>
              <p className="text-sm text-zinc-500 mt-1">{user.dietPlan.description}</p>
              {user.dietPlan.dailyCalories && (
                <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{user.dietPlan.dailyCalories}</p>
                  <p className="text-xs text-emerald-500">Daily Calories</p>
                </div>
              )}
              {user.dietPlan.meals?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Meals</p>
                  {user.dietPlan.meals.map((meal, i) => (
                    <div key={i} className="bg-white/[0.04] rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white text-sm">{meal.mealType}</span>
                        <span className="text-zinc-400 text-xs">{meal.totalCalories} kcal</span>
                      </div>
                      {meal.foods?.map((food, j) => (
                        <div key={j} className="mt-1 pl-2 border-l border-white/10">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-300">{food.name} <span className="text-zinc-500">({food.quantity})</span></span>
                            <span className="text-zinc-500">{food.calories} kcal</span>
                          </div>
                          {(food.protein || food.carbs || food.fat) && (
                            <div className="flex gap-2 text-xs mt-0.5">
                              <span className="text-blue-400">P: {food.protein}g</span>
                              <span className="text-yellow-400">C: {food.carbs}g</span>
                              <span className="text-pink-400">F: {food.fat}g</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-600">
              <Apple size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No diet plan yet.</p>
              <button onClick={handleGeneratePlan} disabled={generating} className="text-xs text-brand-400 hover:underline mt-1">
                Generate one now →
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2"><Calendar size={18} className="text-blue-400" /> Upcoming Sessions</h2>
            <Link to="/bookings" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-6 text-zinc-600">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No upcoming sessions.</p>
              <Link to="/sessions" className="text-xs text-brand-400 hover:underline mt-1 block">Browse sessions →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map(b => (
                <div key={b.id} className="bg-brand-500/5 rounded-xl p-3 border border-brand-500/20">
                  <p className="font-semibold text-white text-sm">{b.session?.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {formatDate(b.session?.date)} · {b.session?.startTime}
                  </p>
                  <p className="text-xs text-brand-400 mt-1">👤 {b.session?.trainer}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-white/[0.07] space-y-2">
            <Link to="/sessions" className="flex items-center justify-between text-sm text-zinc-400 hover:text-brand-400 transition-colors">
              <span>Browse all sessions</span><ChevronRight size={14} />
            </Link>
            <Link to="/bookings" className="flex items-center justify-between text-sm text-zinc-400 hover:text-brand-400 transition-colors">
              <span>Booking history</span><ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Membership + Available Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <MembershipCard />
        {/* Available Sessions Preview */}
        {sessions.length > 0 && (
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Available Sessions</h2>
              <Link to="/sessions" className="text-sm text-brand-400 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.slice(0, 4).map(s => (
                <div key={s.id} className="card hover:border-zinc-600 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white">{s.title}</p>
                      <p className="text-sm text-zinc-500 mt-1">👤 {s.trainer}</p>
                      <p className="text-sm text-zinc-500">📅 {formatDate(s.date)}</p>
                      <p className="text-sm text-zinc-500">🕐 {s.startTime}</p>
                    </div>
                    <span className="badge bg-emerald-500/10 text-emerald-400 text-xs">
                      {s.totalSlots - s.bookedSlots} left
                    </span>
                  </div>
                  {bookedSessionIds.has(s.id) ? (
                    <p className="w-full text-center text-sm mt-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ Booked
                    </p>
                  ) : (
                    <Link to="/sessions" className="btn-primary w-full text-center text-sm mt-3 block py-2">
                      Book Now
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
