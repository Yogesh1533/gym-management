import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import Modal from '../../components/shared/Modal';
import { Plus, Edit, Trash2, Apple, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

// Default meal templates per goal
const MEAL_TEMPLATES = {
  weight_loss: [
    { mealType: 'Breakfast', totalCalories: 440, foods: [
      { name: 'Oatmeal',              quantity: '80g',     calories: 300, protein: 10, carbs: 54, fat: 5 },
      { name: 'Boiled Eggs',          quantity: '2 large', calories: 140, protein: 12, carbs: 1,  fat: 10 },
      { name: 'Green Tea',            quantity: '1 cup',   calories: 0,   protein: 0,  carbs: 0,  fat: 0 },
    ]},
    { mealType: 'Mid-Morning Snack', totalCalories: 200, foods: [
      { name: 'Greek Yogurt (0% fat)', quantity: '200g',  calories: 110, protein: 20, carbs: 6,  fat: 0 },
      { name: 'Almonds',              quantity: '20g',     calories: 120, protein: 4,  carbs: 4,  fat: 10 },
    ]},
    { mealType: 'Lunch', totalCalories: 540, foods: [
      { name: 'Grilled Chicken Breast', quantity: '180g', calories: 300, protein: 56, carbs: 0,  fat: 6 },
      { name: 'Brown Rice',           quantity: '100g dry', calories: 130, protein: 3, carbs: 28, fat: 1 },
      { name: 'Steamed Broccoli',     quantity: '150g',    calories: 50,  protein: 4,  carbs: 10, fat: 0 },
      { name: 'Olive Oil',            quantity: '5ml',     calories: 45,  protein: 0,  carbs: 0,  fat: 5 },
    ]},
    { mealType: 'Dinner', totalCalories: 565, foods: [
      { name: 'Baked Salmon',         quantity: '180g',    calories: 350, protein: 40, carbs: 0,  fat: 20 },
      { name: 'Sweet Potato',         quantity: '150g',    calories: 130, protein: 2,  carbs: 30, fat: 0 },
      { name: 'Mixed Green Salad',    quantity: '1 bowl',  calories: 40,  protein: 2,  carbs: 7,  fat: 0 },
      { name: 'Lemon Juice',          quantity: '1 tbsp',  calories: 5,   protein: 0,  carbs: 1,  fat: 0 },
    ]},
  ],
  muscle_gain: [
    { mealType: 'Breakfast', totalCalories: 710, foods: [
      { name: 'Whole Eggs',           quantity: '4 large', calories: 280, protein: 24, carbs: 2,  fat: 20 },
      { name: 'Whole Wheat Toast',    quantity: '2 slices', calories: 160, protein: 6, carbs: 30, fat: 2 },
      { name: 'Banana',               quantity: '1 large', calories: 120, protein: 1,  carbs: 30, fat: 0 },
      { name: 'Whole Milk',           quantity: '250ml',   calories: 150, protein: 8,  carbs: 12, fat: 8 },
    ]},
    { mealType: 'Pre-Workout', totalCalories: 250, foods: [
      { name: 'Whey Protein Shake',   quantity: '1 scoop', calories: 120, protein: 25, carbs: 3,  fat: 2 },
      { name: 'Banana',               quantity: '1 medium', calories: 100, protein: 1, carbs: 25, fat: 0 },
    ]},
    { mealType: 'Lunch', totalCalories: 700, foods: [
      { name: 'Chicken Breast',       quantity: '220g',    calories: 360, protein: 66, carbs: 0,  fat: 8 },
      { name: 'White Rice',           quantity: '150g dry', calories: 200, protein: 4, carbs: 44, fat: 0 },
      { name: 'Avocado',              quantity: '1/2',     calories: 120, protein: 1,  carbs: 6,  fat: 11 },
    ]},
    { mealType: 'Post-Workout', totalCalories: 250, foods: [
      { name: 'Whey Protein Shake',   quantity: '1 scoop', calories: 120, protein: 25, carbs: 3,  fat: 2 },
      { name: 'Apple',                quantity: '1 medium', calories: 80, protein: 0,  carbs: 21, fat: 0 },
    ]},
    { mealType: 'Dinner', totalCalories: 700, foods: [
      { name: 'Lean Beef Steak',      quantity: '200g',    calories: 400, protein: 46, carbs: 0,  fat: 22 },
      { name: 'Pasta (cooked)',       quantity: '200g',    calories: 260, protein: 9,  carbs: 52, fat: 1 },
      { name: 'Mixed Vegetables',     quantity: '150g',    calories: 60,  protein: 3,  carbs: 12, fat: 0 },
    ]},
  ],
  endurance: [
    { mealType: 'Breakfast', totalCalories: 600, foods: [
      { name: 'Oatmeal with Berries', quantity: '100g oats', calories: 380, protein: 13, carbs: 68, fat: 7 },
      { name: 'Boiled Eggs',          quantity: '2 large', calories: 140, protein: 12, carbs: 1,  fat: 10 },
      { name: 'Orange Juice',         quantity: '200ml',   calories: 90,  protein: 1,  carbs: 21, fat: 0 },
    ]},
    { mealType: 'Pre-Training Snack', totalCalories: 320, foods: [
      { name: 'Banana',               quantity: '1 large', calories: 120, protein: 1,  carbs: 30, fat: 0 },
      { name: 'Energy Bar',           quantity: '1 bar',   calories: 200, protein: 5,  carbs: 38, fat: 5 },
    ]},
    { mealType: 'Lunch', totalCalories: 620, foods: [
      { name: 'Pasta with Tomato Sauce', quantity: '200g cooked', calories: 320, protein: 11, carbs: 64, fat: 2 },
      { name: 'Grilled Chicken',      quantity: '150g',    calories: 250, protein: 46, carbs: 0,  fat: 5 },
      { name: 'Mixed Salad',          quantity: '1 bowl',  calories: 50,  protein: 2,  carbs: 8,  fat: 1 },
    ]},
    { mealType: 'Dinner', totalCalories: 620, foods: [
      { name: 'Brown Rice',           quantity: '150g dry', calories: 200, protein: 4, carbs: 44, fat: 2 },
      { name: 'Grilled Salmon',       quantity: '180g',    calories: 350, protein: 40, carbs: 0,  fat: 20 },
      { name: 'Steamed Vegetables',   quantity: '200g',    calories: 70,  protein: 4,  carbs: 14, fat: 0 },
    ]},
  ],
  general_fitness: [
    { mealType: 'Breakfast', totalCalories: 450, foods: [
      { name: 'Whole Grain Cereal',   quantity: '60g',     calories: 220, protein: 6,  carbs: 44, fat: 3 },
      { name: 'Low-fat Milk',         quantity: '250ml',   calories: 110, protein: 8,  carbs: 12, fat: 3 },
      { name: 'Mixed Fruits',         quantity: '1 bowl',  calories: 120, protein: 1,  carbs: 30, fat: 0 },
    ]},
    { mealType: 'Lunch', totalCalories: 500, foods: [
      { name: 'Grilled Chicken',      quantity: '160g',    calories: 265, protein: 50, carbs: 0,  fat: 6 },
      { name: 'Brown Rice',           quantity: '100g dry', calories: 130, protein: 3, carbs: 28, fat: 1 },
      { name: 'Steamed Vegetables',   quantity: '150g',    calories: 60,  protein: 3,  carbs: 12, fat: 0 },
      { name: 'Olive Oil',            quantity: '5ml',     calories: 45,  protein: 0,  carbs: 0,  fat: 5 },
    ]},
    { mealType: 'Snack', totalCalories: 260, foods: [
      { name: 'Mixed Nuts',           quantity: '30g',     calories: 180, protein: 5,  carbs: 6,  fat: 16 },
      { name: 'Apple',                quantity: '1 medium', calories: 80, protein: 0,  carbs: 21, fat: 0 },
    ]},
    { mealType: 'Dinner', totalCalories: 430, foods: [
      { name: 'Baked Fish (Tilapia)', quantity: '180g',    calories: 220, protein: 45, carbs: 0,  fat: 4 },
      { name: 'Quinoa',               quantity: '100g dry', calories: 170, protein: 6, carbs: 30, fat: 3 },
      { name: 'Mixed Green Salad',    quantity: '1 bowl',  calories: 50,  protein: 2,  carbs: 8,  fat: 1 },
    ]},
  ],
};

const EMPTY_FOOD = { name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fat: 0 };
const EMPTY = { title: '', description: '', goal: 'general_fitness', dailyCalories: 2000, meals: [], restrictions: [] };

const goalColors = {
  weight_loss:    'bg-red-500/10 text-red-400',
  muscle_gain:    'bg-blue-500/10 text-blue-400',
  endurance:      'bg-yellow-500/10 text-yellow-400',
  general_fitness:'bg-emerald-500/10 text-emerald-400',
};

export default function AdminDietPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [expandedMeal, setExpandedMeal] = useState(null);

  useEffect(() => {
    adminAPI.getDietPlans().then(res => setPlans(res.data)).finally(() => setLoading(false));
  }, []);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleGoalChange = (e) => {
    const goal = e.target.value;
    const meals = MEAL_TEMPLATES[goal] || MEAL_TEMPLATES.general_fitness;
    const dailyCalories = meals.reduce((s, m) => s + m.totalCalories, 0);
    setForm({ ...form, goal, meals, dailyCalories });
  };

  const openCreate = () => {
    const meals = MEAL_TEMPLATES.general_fitness;
    const dailyCalories = meals.reduce((s, m) => s + m.totalCalories, 0);
    setForm({ ...EMPTY, meals, dailyCalories });
    setEditing(null);
    setModal(true);
  };

  const openEdit = (p) => {
    setForm({ ...p, restrictions: p.restrictions || [] });
    setEditing(p.id);
    setModal(true);
  };

  // Food editing
  const updateFood = (mealIdx, foodIdx, field, value) => {
    const meals = form.meals.map((meal, mi) => {
      if (mi !== mealIdx) return meal;
      const foods = meal.foods.map((food, fi) =>
        fi === foodIdx ? { ...food, [field]: field === 'name' || field === 'quantity' ? value : parseFloat(value) || 0 } : food
      );
      const totalCalories = foods.reduce((s, f) => s + (parseFloat(f.calories) || 0), 0);
      return { ...meal, foods, totalCalories };
    });
    const dailyCalories = meals.reduce((s, m) => s + m.totalCalories, 0);
    setForm({ ...form, meals, dailyCalories });
  };

  const addFood = (mealIdx) => {
    const meals = form.meals.map((meal, mi) =>
      mi === mealIdx ? { ...meal, foods: [...meal.foods, { ...EMPTY_FOOD }] } : meal
    );
    setForm({ ...form, meals });
  };

  const removeFood = (mealIdx, foodIdx) => {
    const meals = form.meals.map((meal, mi) => {
      if (mi !== mealIdx) return meal;
      const foods = meal.foods.filter((_, fi) => fi !== foodIdx);
      const totalCalories = foods.reduce((s, f) => s + (parseFloat(f.calories) || 0), 0);
      return { ...meal, foods, totalCalories };
    });
    const dailyCalories = meals.reduce((s, m) => s + m.totalCalories, 0);
    setForm({ ...form, meals, dailyCalories });
  };

  const addMeal = () => {
    setForm({ ...form, meals: [...form.meals, { mealType: 'New Meal', totalCalories: 0, foods: [{ ...EMPTY_FOOD }] }] });
  };

  const removeMeal = (mealIdx) => {
    const meals = form.meals.filter((_, mi) => mi !== mealIdx);
    const dailyCalories = meals.reduce((s, m) => s + m.totalCalories, 0);
    setForm({ ...form, meals, dailyCalories });
  };

  const updateMealType = (mealIdx, value) => {
    const meals = form.meals.map((meal, mi) => mi === mealIdx ? { ...meal, mealType: value } : meal);
    setForm({ ...form, meals });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await adminAPI.updateDietPlan(editing, form);
        setPlans(prev => prev.map(p => p.id === editing ? data : p));
        toast.success('Diet plan updated!');
      } else {
        const { data } = await adminAPI.createDietPlan(form);
        setPlans(prev => [data, ...prev]);
        toast.success('Diet plan created!');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diet plan?')) return;
    try {
      await adminAPI.deleteDietPlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plan deleted');
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Diet Plans</h1>
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
                  <span className={`badge ${goalColors[p.goal]} capitalize text-xs`}>{p.goal?.replace(/_/g, ' ')}</span>
                  <span className="badge bg-emerald-500/10 text-emerald-400 text-xs">{p.dailyCalories} kcal/day</span>
                  <span className="badge bg-zinc-700 text-zinc-300 text-xs">{p.meals?.length || 0} meals</span>
                </div>
                <p className="text-sm text-zinc-500 mt-1">{p.description}</p>
                {/* Macro summary */}
                {p.meals?.length > 0 && (() => {
                  const totals = p.meals.reduce((acc, meal) => {
                    meal.foods?.forEach(f => {
                      acc.protein += f.protein || 0;
                      acc.carbs   += f.carbs   || 0;
                      acc.fat     += f.fat     || 0;
                    });
                    return acc;
                  }, { protein: 0, carbs: 0, fat: 0 });
                  return (
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-blue-400">P: {Math.round(totals.protein)}g</span>
                      <span className="text-yellow-400">C: {Math.round(totals.carbs)}g</span>
                      <span className="text-pink-400">F: {Math.round(totals.fat)}g</span>
                    </div>
                  );
                })()}
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

            {/* Expanded Meals */}
            {expandedPlan === p.id && p.meals?.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
                {p.meals.map((meal, mi) => (
                  <div key={mi} className="bg-zinc-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedMeal(expandedMeal === `${p.id}-${mi}` ? null : `${p.id}-${mi}`)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white">{meal.mealType}</span>
                        <span className="text-xs text-emerald-400">{meal.totalCalories} kcal</span>
                        <span className="text-xs text-zinc-500">{meal.foods?.length} foods</span>
                      </div>
                      {expandedMeal === `${p.id}-${mi}` ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
                    </button>
                    {expandedMeal === `${p.id}-${mi}` && (
                      <div className="px-4 pb-3 border-t border-zinc-700">
                        <div className="grid grid-cols-6 gap-2 text-xs text-zinc-500 py-2 font-medium">
                          <span className="col-span-2">Food</span>
                          <span>Qty</span>
                          <span className="text-zinc-400">Kcal</span>
                          <span className="text-blue-400">P(g)</span>
                          <span className="text-yellow-400">C(g)</span>
                        </div>
                        {meal.foods?.map((food, fi) => (
                          <div key={fi} className="grid grid-cols-6 gap-2 text-xs py-1.5 border-b border-zinc-700 last:border-0">
                            <span className="col-span-2 text-white">{food.name}</span>
                            <span className="text-zinc-400">{food.quantity}</span>
                            <span className="text-zinc-300">{food.calories}</span>
                            <span className="text-blue-400">{food.protein}</span>
                            <span className="text-yellow-400">{food.carbs}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {p.restrictions?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.restrictions.map((r, i) => (
                      <span key={i} className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-1 rounded-full">⚠️ {r}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <Apple size={48} className="mx-auto mb-3 opacity-30" />
            <p>No diet plans yet. Create one!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Diet Plan' : 'Create Diet Plan'} size="xl">
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
              <label className="label">Goal</label>
              <select className="input" value={form.goal} onChange={handleGoalChange}>
                <option value="general_fitness">General Fitness</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="label">Daily Calories (auto-calculated)</label>
              <input type="number" className="input bg-zinc-800 text-zinc-400 cursor-not-allowed" value={form.dailyCalories} readOnly />
            </div>
          </div>

          {/* Meals Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Meals & Foods</label>
              <button type="button" onClick={addMeal} className="text-xs text-cyan-400 hover:underline">+ Add Meal</button>
            </div>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {form.meals?.map((meal, mi) => (
                <div key={mi} className="bg-zinc-800 rounded-xl overflow-hidden">
                  {/* Meal Header */}
                  <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-700">
                    <input
                      className="input text-sm py-1 w-40 bg-zinc-700"
                      value={meal.mealType}
                      onChange={e => updateMealType(mi, e.target.value)}
                      placeholder="Meal name"
                    />
                    <span className="text-xs text-emerald-400 ml-auto">{meal.totalCalories} kcal total</span>
                    <button type="button" onClick={() => removeMeal(mi)} className="text-red-400 hover:text-red-300 text-xs">✕ Remove Meal</button>
                  </div>

                  {/* Food Header */}
                  <div className="grid grid-cols-12 gap-1 px-3 pt-2 text-xs text-zinc-500 font-medium">
                    <span className="col-span-3">Food Name</span>
                    <span className="col-span-2">Quantity</span>
                    <span>Kcal</span>
                    <span className="text-blue-400">P(g)</span>
                    <span className="text-yellow-400">C(g)</span>
                    <span className="text-pink-400">F(g)</span>
                    <span className="col-span-2"></span>
                  </div>

                  {/* Foods */}
                  <div className="p-3 space-y-2">
                    {meal.foods?.map((food, fi) => (
                      <div key={fi} className="grid grid-cols-12 gap-1 items-center">
                        <input className="input text-xs py-1 col-span-3" placeholder="e.g. Chicken Breast"
                          value={food.name} onChange={e => updateFood(mi, fi, 'name', e.target.value)} />
                        <input className="input text-xs py-1 col-span-2" placeholder="e.g. 150g"
                          value={food.quantity} onChange={e => updateFood(mi, fi, 'quantity', e.target.value)} />
                        <input className="input text-xs py-1" type="number" placeholder="0"
                          value={food.calories} onChange={e => updateFood(mi, fi, 'calories', e.target.value)} />
                        <input className="input text-xs py-1" type="number" placeholder="0"
                          value={food.protein} onChange={e => updateFood(mi, fi, 'protein', e.target.value)} />
                        <input className="input text-xs py-1" type="number" placeholder="0"
                          value={food.carbs} onChange={e => updateFood(mi, fi, 'carbs', e.target.value)} />
                        <input className="input text-xs py-1" type="number" placeholder="0"
                          value={food.fat} onChange={e => updateFood(mi, fi, 'fat', e.target.value)} />
                        <button type="button" onClick={() => removeFood(mi, fi)}
                          className="col-span-2 text-red-400 hover:text-red-300 text-xs text-center">✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addFood(mi)} className="text-xs text-cyan-400 hover:underline mt-1">
                      + Add Food
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div>
            <label className="label">Dietary Restrictions (comma separated)</label>
            <input
              className="input" placeholder="e.g. No processed sugar, No fried food"
              value={Array.isArray(form.restrictions) ? form.restrictions.join(', ') : form.restrictions || ''}
              onChange={e => setForm({ ...form, restrictions: e.target.value.split(',').map(r => r.trim()).filter(Boolean) })}
            />
          </div>

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
