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
const Booking        = require('../models/Booking');
const Payment        = require('../models/Payment');
const Lead           = require('../models/Lead');
const WeightLog      = require('../models/WeightLog');
const { saveWorkoutPlan, saveDietPlan } = require('../utils/planHelper');

const resetTables = async () => {
  const { sequelize, dialect } = require('./db');
  if (dialect === 'sqlite') {
    await sequelize.query('PRAGMA foreign_keys = OFF');
    await sequelize.sync({ force: true });
    await sequelize.query('PRAGMA foreign_keys = ON');
    return;
  }
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of ['notifications','waitlists','ratings','bookings','weight_logs','sessions','users','workout_exercises','workout_days','workout_plans','diet_foods','diet_meals','diet_plans','membership_plans','payments','leads'])
    await sequelize.query(`TRUNCATE TABLE \`${t}\``);
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
};

// Fills the database with demo data. Assumes connectDB() has already run.
const seedDatabase = async () => {
  await resetTables();

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
  // Never returns a time in the future ("0 days ago at 10:00" could be later than now)
  const daysAgo = (n, hour = 10) => { const d = new Date(today); d.setDate(d.getDate() - n); d.setHours(hour, 0, 0, 0); return d > today ? new Date(today) : d; };
  const memberPass = await bcrypt.hash('member123', 10);
  const plansById = { [mpBasic.id]: mpBasic, [mpStandard.id]: mpStandard, [mpPremium.id]: mpPremium, [mpAnnual.id]: mpAnnual };

  const memberRows = [
    { name: 'John Smith', email: 'john@gym.com', phone: '+1-555-0101', age: 28, weight: 85, height: 178,
      fitnessGoal: 'muscle_gain', workoutPlanId: wpAdvanced.id, dietPlanId: dpMuscleGain.id, membershipPlanId: mpPremium.id, joined: 150 },
    { name: 'Sarah Johnson', email: 'sarah@gym.com', phone: '+1-555-0102', age: 25, weight: 65, height: 165,
      fitnessGoal: 'weight_loss', workoutPlanId: wpBeginner.id, dietPlanId: dpWeightLoss.id, membershipPlanId: mpStandard.id, joined: 120 },
    { name: 'Mike Davis', email: 'mike@gym.com', phone: '+1-555-0103', age: 35, weight: 90, height: 182,
      fitnessGoal: 'general_fitness', membershipPlanId: mpBasic.id, joined: 40 },
    { name: 'Priya Patel',   email: 'priya@gym.com',  age: 31, weight: 58, height: 160, fitnessGoal: 'endurance',       membershipPlanId: mpStandard.id, joined: 95 },
    { name: 'Liam Chen',     email: 'liam@gym.com',   age: 24, weight: 77, height: 181, fitnessGoal: 'muscle_gain',     membershipPlanId: mpPremium.id,  joined: 70 },
    { name: 'Olivia Brown',  email: 'olivia@gym.com', age: 29, weight: 70, height: 168, fitnessGoal: 'weight_loss',     membershipPlanId: mpAnnual.id,   joined: 60 },
    { name: 'Noah Wilson',   email: 'noah@gym.com',   age: 42, weight: 95, height: 185, fitnessGoal: 'general_fitness', membershipPlanId: mpStandard.id, joined: 25 },
    { name: 'Emma Garcia',   email: 'emma@gym.com',   age: 22, weight: 55, height: 163, fitnessGoal: 'endurance',       membershipPlanId: mpBasic.id,    joined: 12 },
  ];
  const members = await User.bulkCreate(memberRows.map(({ joined, ...m }) => ({
    ...m, password: memberPass, role: 'member', createdAt: daysAgo(joined), updatedAt: daysAgo(joined)
  })));
  const [john] = members;

  // Membership payments: one per billing period since each member joined
  const payments = [];
  members.forEach((m, i) => {
    const plan = plansById[m.membershipPlanId];
    const joined = memberRows[i].joined;
    const step = plan.billingCycle === 'yearly' ? 365 : 30;
    let renewsAt = null;
    for (let ago = joined; ago >= 0; ago -= step) {
      const end = new Date(daysAgo(ago)); end.setDate(end.getDate() + step);
      renewsAt = end.toISOString().split('T')[0];
      payments.push({
        userId: m.id, membershipPlanId: plan.id, amount: plan.price, status: 'paid',
        reference: `PYF-DEMO-${m.id}-${ago}`, periodEnd: renewsAt, createdAt: daysAgo(ago), updatedAt: daysAgo(ago)
      });
    }
    m.membershipRenewsAt = renewsAt;
  });
  await Payment.bulkCreate(payments);
  await Promise.all(members.map(m => User.update({ membershipRenewsAt: m.membershipRenewsAt }, { where: { id: m.id } })));

  // Past sessions (with attendance) so history and analytics have data
  const pastTemplates = [
    ['Morning HIIT Blast', 'Coach Alex', 'hiit', '07:00', '08:00', 'Studio A'],
    ['Yoga & Mindfulness', 'Coach Emma', 'yoga', '09:00', '10:00', 'Yoga Room'],
    ['Strength Training Fundamentals', 'Coach Marcus', 'strength', '18:00', '19:30', 'Weight Room'],
    ['Cardio Kickboxing', 'Coach Lisa', 'cardio', '17:00', '18:00', 'Main Floor'],
    ['Core Pilates', 'Coach Emma', 'pilates', '12:00', '12:45', 'Yoga Room'],
    ['CrossFit Challenge', 'Coach Jake', 'crossfit', '06:00', '07:00', 'CrossFit Box'],
  ];
  const pastSessions = await Session.bulkCreate([13, 11, 10, 8, 6, 5, 3, 2, 1].map((ago, i) => {
    const [title, trainer, sessionType, startTime, endTime, location] = pastTemplates[i % pastTemplates.length];
    return { title, trainer, sessionType, date: addDays(-ago), startTime, endTime, totalSlots: 12, bookedSlots: 0,
      location, description: 'Completed class.', createdBy: admin.id, createdAt: daysAgo(ago + 7), updatedAt: daysAgo(ago + 7) };
  }));
  const pastBookings = [];
  pastSessions.forEach((sess, i) => {
    members.forEach((m, j) => {
      // Starter members are left out so their 2-bookings-a-month allowance is still free
      if (m.membershipPlanId === mpBasic.id) return;
      if ((i + j) % 3 === 0 || (m.id === john.id && i % 2 === 0)) {
        const ago = [13, 11, 10, 8, 6, 5, 3, 2, 1][i];
        pastBookings.push({ memberId: m.id, sessionId: sess.id, status: (i + j) % 5 === 0 ? 'confirmed' : 'attended',
          createdAt: daysAgo(ago + 2, 8 + j), updatedAt: daysAgo(ago) });
      }
    });
  });
  await Booking.bulkCreate(pastBookings);
  for (const sess of pastSessions)
    await sess.update({ bookedSlots: pastBookings.filter(b => b.sessionId === sess.id).length });

  // Upcoming sessions for the next week
  await Session.bulkCreate([
    { title: 'Sunrise Mobility Flow', description: 'Gentle mobility work to start the day loose and pain-free.', trainer: 'Coach Emma', sessionType: 'yoga', date: addDays(0), startTime: '18:30', endTime: '19:15', totalSlots: 15, bookedSlots: 6, location: 'Yoga Room', createdBy: admin.id },
    { title: 'Morning HIIT Blast', description: 'High intensity interval training to burn fat fast.', trainer: 'Coach Alex', sessionType: 'hiit', date: addDays(1), startTime: '07:00', endTime: '08:00', totalSlots: 12, bookedSlots: 4, location: 'Studio A', createdBy: admin.id },
    { title: 'Yoga & Mindfulness', description: 'Relaxing yoga session for flexibility and mental wellness.', trainer: 'Coach Emma', sessionType: 'yoga', date: addDays(2), startTime: '09:00', endTime: '10:00', totalSlots: 15, bookedSlots: 7, location: 'Yoga Room', createdBy: admin.id },
    { title: 'Core Pilates', description: 'Build deep core strength and posture control.', trainer: 'Coach Emma', sessionType: 'pilates', date: addDays(2), startTime: '12:00', endTime: '12:45', totalSlots: 10, bookedSlots: 9, location: 'Yoga Room', createdBy: admin.id },
    { title: 'Strength Training Fundamentals', description: 'Learn proper form for compound lifts.', trainer: 'Coach Marcus', sessionType: 'strength', date: addDays(3), startTime: '18:00', endTime: '19:30', totalSlots: 8, bookedSlots: 2, location: 'Weight Room', createdBy: admin.id },
    { title: 'Power Hour', description: 'Heavy barbell work: squat, bench and deadlift variations.', trainer: 'Coach Marcus', sessionType: 'strength', date: addDays(4), startTime: '17:30', endTime: '18:30', totalSlots: 8, bookedSlots: 8, location: 'Weight Room', createdBy: admin.id },
    { title: 'Cardio Kickboxing', description: 'Fun cardio session combining boxing and aerobics.', trainer: 'Coach Lisa', sessionType: 'cardio', date: addDays(5), startTime: '17:00', endTime: '18:00', totalSlots: 20, bookedSlots: 10, location: 'Main Floor', createdBy: admin.id },
    { title: 'Spin & Sweat', description: 'Rhythm-based indoor cycling with interval climbs.', trainer: 'Coach Lisa', sessionType: 'cardio', date: addDays(6), startTime: '07:30', endTime: '08:15', totalSlots: 16, bookedSlots: 5, location: 'Cycle Studio', createdBy: admin.id },
    { title: 'CrossFit Challenge', description: 'Intense CrossFit WOD for experienced athletes.', trainer: 'Coach Jake', sessionType: 'crossfit', date: addDays(7), startTime: '06:00', endTime: '07:00', totalSlots: 10, bookedSlots: 0, location: 'CrossFit Box', createdBy: admin.id },
  ]);

  // Weight history for John so the Progress chart has a trend
  await WeightLog.bulkCreate([88.4, 87.9, 87.1, 86.6, 85.8, 85].map((weight, i) => ({
    userId: john.id, weight, note: i === 0 ? 'Starting point' : null,
    createdAt: daysAgo(35 - i * 7), updatedAt: daysAgo(35 - i * 7)
  })));

  // Free-trial requests from the website
  await Lead.bulkCreate([
    { name: 'Ava Thompson', email: 'ava.t@example.com', phone: '+1-555-0141', goal: 'weight_loss', message: 'Interested in evening classes.', status: 'new', createdAt: daysAgo(1), updatedAt: daysAgo(1) },
    { name: 'Ethan Wright', email: 'ethan.w@example.com', goal: 'muscle_gain', message: 'Do you offer personal training?', status: 'contacted', createdAt: daysAgo(4), updatedAt: daysAgo(3) },
    { name: 'Mia Robinson', email: 'mia.r@example.com', phone: '+1-555-0177', goal: 'endurance', status: 'converted', createdAt: daysAgo(9), updatedAt: daysAgo(7) },
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
};

// Seeds only when the database has no users yet (used on first boot of a fresh server)
const seedIfEmpty = async () => {
  if (await User.count() > 0) return false;
  await seedDatabase();
  return true;
};

module.exports = { seedDatabase, seedIfEmpty };

if (require.main === module) {
  connectDB()
    .then(seedDatabase)
    .then(() => process.exit())
    .catch(err => { console.error(err); process.exit(1); });
}
