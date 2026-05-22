require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./db');
require('./associations');

const User           = require('../models/User');
const WorkoutPlan    = require('../models/WorkoutPlan');
const WorkoutDay     = require('../models/WorkoutDay');
const WorkoutExercise= require('../models/WorkoutExercise');
const DietPlan       = require('../models/DietPlan');
const DietMeal       = require('../models/DietMeal');
const DietFood       = require('../models/DietFood');
const Session        = require('../models/Session');
const MembershipPlan = require('../models/MembershipPlan');
const { saveWorkoutPlan, saveDietPlan } = require('../utils/planHelper');

const seed = async () => {
  await connectDB();
  const { sequelize } = require('./db');

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of ['notifications','waitlists','ratings','bookings','weight_logs','sessions','users','workout_exercises','workout_days','workout_plans','diet_foods','diet_meals','diet_plans','membership_plans'])
    await sequelize.query(`TRUNCATE TABLE \`${t}\``);
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

  // Membership Plans
  const [mpBasic, mpStandard, mpPremium, mpAnnual] = await MembershipPlan.bulkCreate([
    {
      name: 'Starter', tier: 'basic', price: 29, billingCycle: 'monthly', sessionLimit: 2, color: '#71717a',
      features: ['Access to gym', '2 session bookings/month', 'Basic workout plan', 'Locker room access']
    },
    {
      name: 'Active', tier: 'standard', price: 59, billingCycle: 'monthly', sessionLimit: -1, color: '#06b6d4',
      features: ['Unlimited session bookings', 'AI plan generation', 'Custom diet plan', 'Progress tracking', 'Locker room access']
    },
    {
      name: 'Elite', tier: 'premium', price: 99, billingCycle: 'monthly', sessionLimit: -1, color: '#a855f7',
      features: ['Everything in Active', 'Priority session booking', 'Personal trainer sessions', 'Custom meal planning', 'Body measurements tracking', 'Nutrition consultation']
    },
    {
      name: 'Pro Annual', tier: 'annual', price: 799, billingCycle: 'yearly', sessionLimit: -1, color: '#f59e0b',
      features: ['All Elite features', '2 months free', 'Free personal training (4 sessions)', 'Gym merchandise discount', 'Guest passes (2/month)']
    },
  ]);

  // Admin
  const admin = await User.create({
    name: 'Admin User', email: 'admin@gym.com', password: 'admin123', role: 'admin'
  });

  // Workout Plans
  const wpBeginner = await saveWorkoutPlan({
    title: 'Beginner Full Body',
    description: 'Perfect for gym newcomers. 3 days/week full body training.',
    level: 'beginner', goal: 'general_fitness', durationWeeks: 4,
    schedule: [
      { day: 'Monday', focus: 'Full Body', exercises: [
        { name: 'Squats', sets: 3, reps: '10', notes: 'Bodyweight' },
        { name: 'Push-ups', sets: 3, reps: '8-10' },
        { name: 'Dumbbell Rows', sets: 3, reps: '10', notes: '5kg each side' },
        { name: 'Plank', sets: 3, duration: '30 seconds' }
      ]},
      { day: 'Wednesday', focus: 'Cardio + Core', exercises: [
        { name: 'Treadmill Walk', duration: '20 mins' },
        { name: 'Crunches', sets: 3, reps: '15' },
        { name: 'Leg Raises', sets: 3, reps: '12' }
      ]},
      { day: 'Friday', focus: 'Full Body', exercises: [
        { name: 'Lunges', sets: 3, reps: '10 each leg' },
        { name: 'Dumbbell Press', sets: 3, reps: '10', notes: '5kg' },
        { name: 'Lat Pulldown', sets: 3, reps: '10' }
      ]}
    ]
  }, admin.id);

  const wpAdvanced = await saveWorkoutPlan({
    title: 'Advanced Muscle Builder',
    description: 'High intensity 5-day split for muscle gain.',
    level: 'advanced', goal: 'muscle_gain', durationWeeks: 8,
    schedule: [
      { day: 'Monday', focus: 'Chest & Triceps', exercises: [
        { name: 'Bench Press', sets: 4, reps: '8-10', notes: '80kg' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10' },
        { name: 'Tricep Dips', sets: 3, reps: '12' },
        { name: 'Cable Flyes', sets: 3, reps: '12' }
      ]},
      { day: 'Tuesday', focus: 'Back & Biceps', exercises: [
        { name: 'Deadlift', sets: 4, reps: '6', notes: '100kg' },
        { name: 'Pull-ups', sets: 4, reps: '8' },
        { name: 'Barbell Curl', sets: 3, reps: '10' }
      ]},
      { day: 'Thursday', focus: 'Legs', exercises: [
        { name: 'Barbell Squat', sets: 4, reps: '8', notes: '90kg' },
        { name: 'Leg Press', sets: 3, reps: '12' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10' }
      ]}
    ]
  }, admin.id);

  // Diet Plans
  const dpWeightLoss = await saveDietPlan({
    title: 'Weight Loss Diet',
    description: 'Calorie deficit plan with high protein to preserve muscle.',
    goal: 'weight_loss', dailyCalories: 1800,
    meals: [
      { mealType: 'Breakfast', totalCalories: 440, foods: [
        { name: 'Oatmeal', quantity: '1 cup', calories: 300, protein: 10, carbs: 54, fat: 5 },
        { name: 'Boiled Eggs', quantity: '2', calories: 140, protein: 12, carbs: 1, fat: 10 },
        { name: 'Green Tea', quantity: '1 cup', calories: 0, protein: 0, carbs: 0, fat: 0 }
      ]},
      { mealType: 'Lunch', totalCalories: 410, foods: [
        { name: 'Grilled Chicken Breast', quantity: '150g', calories: 250, protein: 46, carbs: 0, fat: 5 },
        { name: 'Brown Rice', quantity: '1/2 cup', calories: 110, protein: 2, carbs: 24, fat: 1 },
        { name: 'Salad', quantity: '1 bowl', calories: 50, protein: 2, carbs: 8, fat: 1 }
      ]},
      { mealType: 'Dinner', totalCalories: 465, foods: [
        { name: 'Baked Salmon', quantity: '150g', calories: 280, protein: 35, carbs: 0, fat: 15 },
        { name: 'Steamed Broccoli', quantity: '1 cup', calories: 55, protein: 4, carbs: 10, fat: 0 },
        { name: 'Sweet Potato', quantity: '1 medium', calories: 130, protein: 2, carbs: 30, fat: 0 }
      ]},
      { mealType: 'Snack', totalCalories: 200, foods: [
        { name: 'Greek Yogurt', quantity: '1 cup', calories: 130, protein: 20, carbs: 6, fat: 0 },
        { name: 'Almonds', quantity: '10 pieces', calories: 70, protein: 3, carbs: 3, fat: 6 }
      ]}
    ]
  }, admin.id);

  const dpMuscleGain = await saveDietPlan({
    title: 'Muscle Gain Diet',
    description: 'High calorie, high protein diet for muscle building.',
    goal: 'muscle_gain', dailyCalories: 3000,
    meals: [
      { mealType: 'Breakfast', totalCalories: 710, foods: [
        { name: 'Scrambled Eggs', quantity: '4 eggs', calories: 280, protein: 24, carbs: 2, fat: 20 },
        { name: 'Whole Wheat Toast', quantity: '2 slices', calories: 160, protein: 6, carbs: 30, fat: 2 },
        { name: 'Banana', quantity: '1 large', calories: 120, protein: 1, carbs: 30, fat: 0 },
        { name: 'Milk', quantity: '1 glass', calories: 150, protein: 8, carbs: 12, fat: 8 }
      ]},
      { mealType: 'Lunch', totalCalories: 650, foods: [
        { name: 'Chicken Breast', quantity: '200g', calories: 330, protein: 62, carbs: 0, fat: 7 },
        { name: 'White Rice', quantity: '1 cup', calories: 200, protein: 4, carbs: 44, fat: 0 },
        { name: 'Avocado', quantity: '1/2', calories: 120, protein: 1, carbs: 6, fat: 11 }
      ]},
      { mealType: 'Post-Workout', totalCalories: 250, foods: [
        { name: 'Protein Shake', quantity: '1 scoop', calories: 150, protein: 25, carbs: 3, fat: 2 },
        { name: 'Banana', quantity: '1', calories: 100, protein: 1, carbs: 25, fat: 0 }
      ]},
      { mealType: 'Dinner', totalCalories: 700, foods: [
        { name: 'Beef Steak', quantity: '200g', calories: 400, protein: 46, carbs: 0, fat: 22 },
        { name: 'Pasta', quantity: '1 cup', calories: 220, protein: 8, carbs: 44, fat: 1 },
        { name: 'Mixed Vegetables', quantity: '1 cup', calories: 80, protein: 4, carbs: 16, fat: 1 }
      ]}
    ]
  }, admin.id);

  // Members
  const today = new Date();
  const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };

  await User.bulkCreate([
    {
      name: 'John Smith', email: 'john@gym.com',
      password: await bcrypt.hash('member123', 10),
      role: 'member', phone: '+1-555-0101', age: 28, weight: 85, height: 178,
      fitnessGoal: 'muscle_gain', workoutPlanId: wpAdvanced.id, dietPlanId: dpMuscleGain.id,
      membershipPlanId: mpPremium.id
    },
    {
      name: 'Sarah Johnson', email: 'sarah@gym.com',
      password: await bcrypt.hash('member123', 10),
      role: 'member', phone: '+1-555-0102', age: 25, weight: 65, height: 165,
      fitnessGoal: 'weight_loss', workoutPlanId: wpBeginner.id, dietPlanId: dpWeightLoss.id,
      membershipPlanId: mpStandard.id
    },
    {
      name: 'Mike Davis', email: 'mike@gym.com',
      password: await bcrypt.hash('member123', 10),
      role: 'member', phone: '+1-555-0103', age: 35, weight: 90, height: 182,
      fitnessGoal: 'general_fitness', membershipPlanId: mpBasic.id
    }
  ]);

  // Sessions
  await Session.bulkCreate([
    { title: 'Morning HIIT Blast', description: 'High intensity interval training to burn fat fast.', trainer: 'Coach Alex', sessionType: 'hiit', date: addDays(1), startTime: '07:00', endTime: '08:00', totalSlots: 12, bookedSlots: 4, location: 'Studio A', createdBy: admin.id },
    { title: 'Yoga & Mindfulness', description: 'Relaxing yoga session for flexibility and mental wellness.', trainer: 'Coach Emma', sessionType: 'yoga', date: addDays(2), startTime: '09:00', endTime: '10:00', totalSlots: 15, bookedSlots: 7, location: 'Yoga Room', createdBy: admin.id },
    { title: 'Strength Training Fundamentals', description: 'Learn proper form for compound lifts.', trainer: 'Coach Marcus', sessionType: 'strength', date: addDays(3), startTime: '18:00', endTime: '19:30', totalSlots: 8, bookedSlots: 2, location: 'Weight Room', createdBy: admin.id },
    { title: 'Cardio Kickboxing', description: 'Fun cardio session combining boxing and aerobics.', trainer: 'Coach Lisa', sessionType: 'cardio', date: addDays(5), startTime: '17:00', endTime: '18:00', totalSlots: 20, bookedSlots: 10, location: 'Main Floor', createdBy: admin.id },
    { title: 'CrossFit Challenge', description: 'Intense CrossFit WOD for experienced athletes.', trainer: 'Coach Jake', sessionType: 'crossfit', date: addDays(7), startTime: '06:00', endTime: '07:00', totalSlots: 10, bookedSlots: 0, location: 'CrossFit Box', createdBy: admin.id }
  ]);

  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Seed complete!');
    console.log('─────────────────────────────────');
    console.log('Admin:   admin@gym.com  / admin123');
    console.log('Member1: john@gym.com   / member123');
    console.log('Member2: sarah@gym.com  / member123');
    console.log('Member3: mike@gym.com   / member123');
    console.log('─────────────────────────────────');
  }
  process.exit();
};

seed().catch(err => { console.error(err); process.exit(1); });
