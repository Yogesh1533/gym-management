const WorkoutPlan     = require('../models/WorkoutPlan');
const WorkoutDay      = require('../models/WorkoutDay');
const WorkoutExercise = require('../models/WorkoutExercise');
const DietPlan        = require('../models/DietPlan');
const DietMeal        = require('../models/DietMeal');
const DietFood        = require('../models/DietFood');

// Save a workout plan with its days and exercises
const saveWorkoutPlan = async (planData, createdBy) => {
  const { schedule, ...planFields } = planData;

  const plan = await WorkoutPlan.create({ ...planFields, createdBy });

  if (schedule && schedule.length > 0) {
    for (let i = 0; i < schedule.length; i++) {
      const dayData = schedule[i];
      const day = await WorkoutDay.create({
        workoutPlanId: plan.id,
        day:   dayData.day,
        focus: dayData.focus,
        order: i,
      });

      if (dayData.exercises && dayData.exercises.length > 0) {
        await WorkoutExercise.bulkCreate(
          dayData.exercises.map((ex, j) => ({
            workoutDayId: day.id,
            name:     ex.name,
            sets:     ex.sets     || null,
            reps:     ex.reps     || null,
            duration: ex.duration || null,
            notes:    ex.notes    || null,
            order:    j,
          }))
        );
      }
    }
  }

  return getWorkoutPlanWithSchedule(plan.id);
};

// Fetch a workout plan with all days and exercises
const getWorkoutPlanWithSchedule = async (planId) => {
  const plan = await WorkoutPlan.findByPk(planId, {
    include: [{
      model: WorkoutDay,
      as: 'days',
      include: [{ model: WorkoutExercise, as: 'exercises', order: [['order', 'ASC']] }],
      order: [['order', 'ASC']],
    }]
  });
  if (!plan) return null;
  return formatWorkoutPlan(plan);
};

// Format workout plan to match old JSON shape (for frontend compatibility)
const formatWorkoutPlan = (plan) => {
  const p = plan.toJSON ? plan.toJSON() : plan;
  return {
    ...p,
    schedule: (p.days || []).map(day => ({
      day:       day.day,
      focus:     day.focus,
      exercises: (day.exercises || []).map(ex => ({
        name:     ex.name,
        sets:     ex.sets,
        reps:     ex.reps,
        duration: ex.duration,
        notes:    ex.notes,
      }))
    }))
  };
};

// Save a diet plan with its meals and foods
const saveDietPlan = async (planData, createdBy) => {
  const { meals, ...planFields } = planData;

  const plan = await DietPlan.create({ ...planFields, createdBy });

  if (meals && meals.length > 0) {
    for (let i = 0; i < meals.length; i++) {
      const mealData = meals[i];
      const meal = await DietMeal.create({
        dietPlanId:    plan.id,
        mealType:      mealData.mealType,
        totalCalories: mealData.totalCalories || 0,
        order:         i,
      });

      if (mealData.foods && mealData.foods.length > 0) {
        await DietFood.bulkCreate(
          mealData.foods.map((food, j) => ({
            dietMealId: meal.id,
            name:       food.name,
            quantity:   food.quantity  || null,
            calories:   food.calories  || 0,
            protein:    food.protein   || 0,
            carbs:      food.carbs     || 0,
            fat:        food.fat       || 0,
            order:      j,
          }))
        );
      }
    }
  }

  return getDietPlanWithMeals(plan.id);
};

// Fetch a diet plan with all meals and foods
const getDietPlanWithMeals = async (planId) => {
  const plan = await DietPlan.findByPk(planId, {
    include: [{
      model: DietMeal,
      as: 'meals',
      include: [{ model: DietFood, as: 'foods', order: [['order', 'ASC']] }],
      order: [['order', 'ASC']],
    }]
  });
  if (!plan) return null;
  return formatDietPlan(plan);
};

// Format diet plan to match old JSON shape (for frontend compatibility)
const formatDietPlan = (plan) => {
  const p = plan.toJSON ? plan.toJSON() : plan;
  return {
    ...p,
    meals: (p.meals || []).map(meal => ({
      mealType:      meal.mealType,
      totalCalories: meal.totalCalories,
      foods: (meal.foods || []).map(food => ({
        name:     food.name,
        quantity: food.quantity,
        calories: food.calories,
        protein:  food.protein,
        carbs:    food.carbs,
        fat:      food.fat,
      }))
    }))
  };
};

// Delete all days/exercises for a plan (used before update)
const deleteWorkoutSchedule = async (planId) => {
  const days = await WorkoutDay.findAll({ where: { workoutPlanId: planId } });
  for (const day of days) {
    await WorkoutExercise.destroy({ where: { workoutDayId: day.id } });
  }
  await WorkoutDay.destroy({ where: { workoutPlanId: planId } });
};

// Delete all meals/foods for a plan (used before update)
const deleteDietMeals = async (planId) => {
  const meals = await DietMeal.findAll({ where: { dietPlanId: planId } });
  for (const meal of meals) {
    await DietFood.destroy({ where: { dietMealId: meal.id } });
  }
  await DietMeal.destroy({ where: { dietPlanId: planId } });
};

module.exports = {
  saveWorkoutPlan, getWorkoutPlanWithSchedule, formatWorkoutPlan, deleteWorkoutSchedule,
  saveDietPlan, getDietPlanWithMeals, formatDietPlan, deleteDietMeals,
};
