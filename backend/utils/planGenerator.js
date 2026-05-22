const calcBMI = (weight, height) => {
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25)   return 'normal';
  if (bmi < 30)   return 'overweight';
  return 'obese';
};

const calcCalories = (weight, height, age, goal) => {
  const bmr = 10 * weight + 6.25 * height - 5 * (age || 25) + 5;
  const tdee = Math.round(bmr * 1.55);
  if (goal === 'weight_loss')  return tdee - 500;
  if (goal === 'muscle_gain')  return tdee + 400;
  return tdee;
};

const calcMacros = (calories, goal) => {
  // Returns grams of protein, carbs, fat
  if (goal === 'weight_loss')  return { protein: Math.round(calories * 0.35 / 4), carbs: Math.round(calories * 0.35 / 4), fat: Math.round(calories * 0.30 / 9) };
  if (goal === 'muscle_gain')  return { protein: Math.round(calories * 0.30 / 4), carbs: Math.round(calories * 0.50 / 4), fat: Math.round(calories * 0.20 / 9) };
  if (goal === 'endurance')    return { protein: Math.round(calories * 0.20 / 4), carbs: Math.round(calories * 0.60 / 4), fat: Math.round(calories * 0.20 / 9) };
  return                              { protein: Math.round(calories * 0.25 / 4), carbs: Math.round(calories * 0.45 / 4), fat: Math.round(calories * 0.30 / 9) };
};

const determineLevel = (bmiCategory, goal) => {
  if (bmiCategory === 'obese' || bmiCategory === 'underweight') return 'beginner';
  if (goal === 'muscle_gain') return 'advanced';
  return 'intermediate';
};

// All possible training days per goal
const ALL_DAYS = {
  weight_loss: [
    { day: 'Monday',    focus: 'Cardio + Upper Body', exercises: [
      { name: 'Treadmill Run',       sets: 1,  reps: '1',  duration: '20 mins', notes: 'Moderate pace' },
      { name: 'Push-ups',            sets: 3,  reps: '12' },
      { name: 'Dumbbell Rows',       sets: 3,  reps: '12', notes: '8-10kg each side' },
      { name: 'Shoulder Press',      sets: 3,  reps: '10', notes: '8kg dumbbells' },
      { name: 'Tricep Pushdowns',    sets: 3,  reps: '12' },
    ]},
    { day: 'Tuesday',   focus: 'HIIT Circuit', exercises: [
      { name: 'Jumping Jacks',       sets: 4,  reps: '30', duration: '30 seconds' },
      { name: 'Burpees',             sets: 4,  reps: '10' },
      { name: 'Mountain Climbers',   sets: 4,  reps: '20', duration: '30 seconds' },
      { name: 'High Knees',          sets: 4,  reps: '30', duration: '30 seconds' },
      { name: 'Jump Squats',         sets: 3,  reps: '15' },
    ]},
    { day: 'Wednesday', focus: 'Active Recovery', exercises: [
      { name: 'Brisk Walking',       sets: 1,  reps: '1',  duration: '30 mins' },
      { name: 'Full Body Stretch',   sets: 3,  reps: '1',  duration: '15 mins' },
    ]},
    { day: 'Thursday',  focus: 'Lower Body', exercises: [
      { name: 'Squats',              sets: 4,  reps: '15' },
      { name: 'Lunges',              sets: 3,  reps: '12 each leg' },
      { name: 'Leg Press',           sets: 3,  reps: '15', notes: 'Moderate weight' },
      { name: 'Glute Bridges',       sets: 3,  reps: '20' },
      { name: 'Calf Raises',         sets: 3,  reps: '20' },
    ]},
    { day: 'Friday',    focus: 'Full Body Circuit', exercises: [
      { name: 'Kettlebell Swings',   sets: 4,  reps: '15', notes: '12-16kg' },
      { name: 'Box Jumps',           sets: 3,  reps: '10' },
      { name: 'Plank',               sets: 3,  reps: '1',  duration: '45 seconds' },
      { name: 'Battle Ropes',        sets: 3,  reps: '1',  duration: '30 seconds' },
      { name: 'Bicycle Crunches',    sets: 3,  reps: '20' },
    ]},
    { day: 'Saturday',  focus: 'Steady Cardio', exercises: [
      { name: 'Cycling or Swimming', sets: 1,  reps: '1',  duration: '40 mins', notes: 'Steady state' },
    ]},
  ],
  muscle_gain: [
    { day: 'Monday',    focus: 'Chest & Triceps', exercises: [
      { name: 'Bench Press',         sets: 4,  reps: '8-10',  notes: 'Progressive overload' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10', notes: '15-20kg' },
      { name: 'Cable Flyes',         sets: 3,  reps: '12' },
      { name: 'Tricep Pushdowns',    sets: 3,  reps: '12' },
      { name: 'Skull Crushers',      sets: 3,  reps: '10',   notes: 'EZ bar' },
    ]},
    { day: 'Tuesday',   focus: 'Back & Biceps', exercises: [
      { name: 'Deadlift',            sets: 4,  reps: '6-8',   notes: 'Heavy, progressive' },
      { name: 'Pull-ups',            sets: 4,  reps: '8',     notes: 'Add weight if easy' },
      { name: 'Barbell Row',         sets: 3,  reps: '10' },
      { name: 'Barbell Curl',        sets: 3,  reps: '10' },
      { name: 'Hammer Curls',        sets: 3,  reps: '12',   notes: '10-12kg' },
    ]},
    { day: 'Wednesday', focus: 'Rest / Light Cardio', exercises: [
      { name: 'Walking',             sets: 1,  reps: '1',  duration: '20 mins' },
      { name: 'Foam Rolling',        sets: 1,  reps: '1',  duration: '10 mins' },
    ]},
    { day: 'Thursday',  focus: 'Shoulders & Abs', exercises: [
      { name: 'Overhead Press',      sets: 4,  reps: '8-10' },
      { name: 'Lateral Raises',      sets: 3,  reps: '15',   notes: '8-10kg' },
      { name: 'Face Pulls',          sets: 3,  reps: '15' },
      { name: 'Weighted Crunches',   sets: 3,  reps: '15' },
      { name: 'Hanging Leg Raises',  sets: 3,  reps: '12' },
    ]},
    { day: 'Friday',    focus: 'Legs', exercises: [
      { name: 'Barbell Squat',       sets: 4,  reps: '8',    notes: 'Progressive overload' },
      { name: 'Romanian Deadlift',   sets: 3,  reps: '10' },
      { name: 'Leg Press',           sets: 3,  reps: '12' },
      { name: 'Leg Curl',            sets: 3,  reps: '12' },
      { name: 'Calf Raises',         sets: 4,  reps: '15',   notes: 'Weighted' },
    ]},
    { day: 'Saturday',  focus: 'Arms & Weak Points', exercises: [
      { name: 'Preacher Curl',       sets: 3,  reps: '10' },
      { name: 'Tricep Dips',         sets: 3,  reps: '12',   notes: 'Add weight if easy' },
      { name: 'Concentration Curl',  sets: 3,  reps: '12' },
      { name: 'Overhead Tricep Ext', sets: 3,  reps: '12' },
    ]},
  ],
  endurance: [
    { day: 'Monday',    focus: 'Long Run', exercises: [
      { name: 'Outdoor Run',         sets: 1,  reps: '1',  duration: '30-45 mins', notes: 'Conversational pace' },
    ]},
    { day: 'Tuesday',   focus: 'Cross Training + Core', exercises: [
      { name: 'Cycling',             sets: 1,  reps: '1',  duration: '40 mins' },
      { name: 'Plank',               sets: 3,  reps: '1',  duration: '60 seconds' },
      { name: 'Bicycle Crunches',    sets: 3,  reps: '20' },
      { name: 'Leg Raises',          sets: 3,  reps: '15' },
    ]},
    { day: 'Wednesday', focus: 'Interval Training', exercises: [
      { name: 'Sprint Intervals',    sets: 8,  reps: '1',  duration: '30s on / 90s off' },
      { name: 'Cool Down Walk',      sets: 1,  reps: '1',  duration: '10 mins' },
    ]},
    { day: 'Thursday',  focus: 'Strength + Cardio', exercises: [
      { name: 'Squats',              sets: 3,  reps: '15' },
      { name: 'Push-ups',            sets: 3,  reps: '15' },
      { name: 'Dumbbell Rows',       sets: 3,  reps: '12' },
      { name: 'Rowing Machine',      sets: 1,  reps: '1',  duration: '20 mins' },
    ]},
    { day: 'Friday',    focus: 'Tempo Run', exercises: [
      { name: 'Tempo Run',           sets: 1,  reps: '1',  duration: '25 mins', notes: 'Comfortably hard pace' },
    ]},
    { day: 'Saturday',  focus: 'Long Cardio', exercises: [
      { name: 'Cycling or Swimming', sets: 1,  reps: '1',  duration: '60 mins' },
    ]},
  ],
  general_fitness: [
    { day: 'Monday',    focus: 'Full Body Strength', exercises: [
      { name: 'Squats',              sets: 3,  reps: '12' },
      { name: 'Push-ups',            sets: 3,  reps: '10' },
      { name: 'Dumbbell Rows',       sets: 3,  reps: '12', notes: '8kg' },
      { name: 'Shoulder Press',      sets: 3,  reps: '10' },
      { name: 'Plank',               sets: 3,  reps: '1',  duration: '30 seconds' },
    ]},
    { day: 'Tuesday',   focus: 'Cardio + Core', exercises: [
      { name: 'Treadmill Jog',       sets: 1,  reps: '1',  duration: '25 mins' },
      { name: 'Bicycle Crunches',    sets: 3,  reps: '20' },
      { name: 'Russian Twists',      sets: 3,  reps: '15' },
      { name: 'Leg Raises',          sets: 3,  reps: '12' },
    ]},
    { day: 'Wednesday', focus: 'Active Recovery', exercises: [
      { name: 'Yoga / Stretching',   sets: 1,  reps: '1',  duration: '30 mins' },
    ]},
    { day: 'Thursday',  focus: 'Lower Body', exercises: [
      { name: 'Lunges',              sets: 3,  reps: '10 each leg' },
      { name: 'Leg Press',           sets: 3,  reps: '12' },
      { name: 'Glute Bridges',       sets: 3,  reps: '15' },
      { name: 'Calf Raises',         sets: 3,  reps: '20' },
    ]},
    { day: 'Friday',    focus: 'Upper Body + Flexibility', exercises: [
      { name: 'Dumbbell Press',      sets: 3,  reps: '10' },
      { name: 'Lat Pulldown',        sets: 3,  reps: '12' },
      { name: 'Bicep Curls',         sets: 3,  reps: '12' },
      { name: 'Tricep Dips',         sets: 3,  reps: '10' },
      { name: 'Yoga Stretching',     sets: 1,  reps: '1',  duration: '15 mins' },
    ]},
    { day: 'Saturday',  focus: 'Cardio + Fun', exercises: [
      { name: 'Swimming or Cycling', sets: 1,  reps: '1',  duration: '30 mins' },
    ]},
  ],
};

const generateWorkoutPlan = (goal, bmiCategory, level, gymDays) => {
  const days = Math.min(Math.max(gymDays || 3, 2), 6);
  const allDays = ALL_DAYS[goal] || ALL_DAYS.general_fitness;
  const schedule = allDays.slice(0, days);

  const goalTitles = {
    weight_loss: 'AI Fat Burn Program',
    muscle_gain: 'AI Muscle Builder Program',
    endurance: 'AI Endurance Program',
    general_fitness: 'AI General Fitness Program',
  };

  const goalDescs = {
    weight_loss: `Fat-burning plan for ${days} days/week (BMI: ${bmiCategory}). Cardio + circuits to maximize calorie burn.`,
    muscle_gain: `Hypertrophy plan for ${days} days/week (BMI: ${bmiCategory}). Progressive overload split for maximum muscle growth.`,
    endurance: `Endurance plan for ${days} days/week (BMI: ${bmiCategory}). Builds cardiovascular capacity and stamina.`,
    general_fitness: `Balanced fitness plan for ${days} days/week (BMI: ${bmiCategory}). Mix of strength, cardio, and flexibility.`,
  };

  return {
    title: goalTitles[goal] || goalTitles.general_fitness,
    description: goalDescs[goal] || goalDescs.general_fitness,
    level,
    durationWeeks: goal === 'muscle_gain' ? 10 : goal === 'weight_loss' ? 8 : 6,
    schedule,
  };
};

const generateDietPlan = (goal, bmiCategory, dailyCalories, weight) => {
  const macros = calcMacros(dailyCalories, goal);
  const protein = macros.protein;
  const carbs = macros.carbs;
  const fat = macros.fat;

  const macroNote = `Daily targets — Protein: ${protein}g | Carbs: ${carbs}g | Fat: ${fat}g`;

  const plans = {
    weight_loss: {
      title: 'AI Weight Loss Diet',
      description: `Calorie deficit plan (BMI: ${bmiCategory}). Target: ${dailyCalories} kcal/day. ${macroNote}.`,
      dailyCalories,
      meals: [
        { mealType: 'Breakfast', totalCalories: Math.round(dailyCalories * 0.25), foods: [
          { name: 'Oatmeal',              quantity: '80g',      calories: 300, protein: 10, carbs: 54, fat: 5 },
          { name: 'Boiled Eggs',          quantity: '2 large',  calories: 140, protein: 12, carbs: 1,  fat: 10 },
          { name: 'Green Tea',            quantity: '1 cup',    calories: 0,   protein: 0,  carbs: 0,  fat: 0 },
        ]},
        { mealType: 'Mid-Morning Snack', totalCalories: Math.round(dailyCalories * 0.1), foods: [
          { name: 'Greek Yogurt (0% fat)', quantity: '200g',   calories: 110, protein: 20, carbs: 6,  fat: 0 },
          { name: 'Almonds',              quantity: '20g',      calories: 120, protein: 4,  carbs: 4,  fat: 10 },
        ]},
        { mealType: 'Lunch', totalCalories: Math.round(dailyCalories * 0.30), foods: [
          { name: 'Grilled Chicken Breast', quantity: '180g',  calories: 300, protein: 56, carbs: 0,  fat: 6 },
          { name: 'Brown Rice',           quantity: '100g dry', calories: 130, protein: 3,  carbs: 28, fat: 1 },
          { name: 'Steamed Broccoli',     quantity: '150g',     calories: 50,  protein: 4,  carbs: 10, fat: 0 },
          { name: 'Olive Oil (dressing)', quantity: '5ml',      calories: 45,  protein: 0,  carbs: 0,  fat: 5 },
        ]},
        { mealType: 'Dinner', totalCalories: Math.round(dailyCalories * 0.35), foods: [
          { name: 'Baked Salmon',         quantity: '180g',     calories: 350, protein: 40, carbs: 0,  fat: 20 },
          { name: 'Sweet Potato',         quantity: '150g',     calories: 130, protein: 2,  carbs: 30, fat: 0 },
          { name: 'Mixed Green Salad',    quantity: '1 bowl',   calories: 40,  protein: 2,  carbs: 7,  fat: 0 },
          { name: 'Lemon Juice',          quantity: '1 tbsp',   calories: 5,   protein: 0,  carbs: 1,  fat: 0 },
        ]},
      ],
      restrictions: ['No processed sugar', 'No fried food', 'Limit sodium', 'Drink 3L water/day'],
    },
    muscle_gain: {
      title: 'AI Muscle Gain Diet',
      description: `Calorie surplus plan (BMI: ${bmiCategory}). Target: ${dailyCalories} kcal/day. ${macroNote}.`,
      dailyCalories,
      meals: [
        { mealType: 'Breakfast', totalCalories: Math.round(dailyCalories * 0.25), foods: [
          { name: 'Whole Eggs',           quantity: '4 large',  calories: 280, protein: 24, carbs: 2,  fat: 20 },
          { name: 'Whole Wheat Toast',    quantity: '2 slices', calories: 160, protein: 6,  carbs: 30, fat: 2 },
          { name: 'Banana',               quantity: '1 large',  calories: 120, protein: 1,  carbs: 30, fat: 0 },
          { name: 'Whole Milk',           quantity: '250ml',    calories: 150, protein: 8,  carbs: 12, fat: 8 },
        ]},
        { mealType: 'Pre-Workout', totalCalories: Math.round(dailyCalories * 0.10), foods: [
          { name: 'Whey Protein Shake',   quantity: '1 scoop (30g)', calories: 120, protein: 25, carbs: 3, fat: 2 },
          { name: 'Banana',               quantity: '1 medium', calories: 100, protein: 1,  carbs: 25, fat: 0 },
        ]},
        { mealType: 'Lunch', totalCalories: Math.round(dailyCalories * 0.28), foods: [
          { name: 'Chicken Breast',       quantity: '220g',     calories: 360, protein: 66, carbs: 0,  fat: 8 },
          { name: 'White Rice',           quantity: '150g dry', calories: 200, protein: 4,  carbs: 44, fat: 0 },
          { name: 'Avocado',              quantity: '1/2',      calories: 120, protein: 1,  carbs: 6,  fat: 11 },
          { name: 'Olive Oil',            quantity: '10ml',     calories: 90,  protein: 0,  carbs: 0,  fat: 10 },
        ]},
        { mealType: 'Post-Workout', totalCalories: Math.round(dailyCalories * 0.10), foods: [
          { name: 'Whey Protein Shake',   quantity: '1 scoop (30g)', calories: 120, protein: 25, carbs: 3, fat: 2 },
          { name: 'Apple',                quantity: '1 medium', calories: 80,  protein: 0,  carbs: 21, fat: 0 },
        ]},
        { mealType: 'Dinner', totalCalories: Math.round(dailyCalories * 0.27), foods: [
          { name: 'Lean Beef Steak',      quantity: '200g',     calories: 400, protein: 46, carbs: 0,  fat: 22 },
          { name: 'Pasta (cooked)',       quantity: '200g',     calories: 260, protein: 9,  carbs: 52, fat: 1 },
          { name: 'Mixed Vegetables',     quantity: '150g',     calories: 60,  protein: 3,  carbs: 12, fat: 0 },
        ]},
      ],
      restrictions: ['No alcohol', 'Limit junk food', 'Eat every 3-4 hours', 'Drink 3L water/day'],
    },
    endurance: {
      title: 'AI Endurance Diet',
      description: `High-carb endurance plan (BMI: ${bmiCategory}). Target: ${dailyCalories} kcal/day. ${macroNote}.`,
      dailyCalories,
      meals: [
        { mealType: 'Breakfast', totalCalories: Math.round(dailyCalories * 0.25), foods: [
          { name: 'Oatmeal with Berries', quantity: '100g oats', calories: 380, protein: 13, carbs: 68, fat: 7 },
          { name: 'Boiled Eggs',          quantity: '2 large',  calories: 140, protein: 12, carbs: 1,  fat: 10 },
          { name: 'Orange Juice',         quantity: '200ml',    calories: 90,  protein: 1,  carbs: 21, fat: 0 },
        ]},
        { mealType: 'Pre-Training Snack', totalCalories: Math.round(dailyCalories * 0.10), foods: [
          { name: 'Banana',               quantity: '1 large',  calories: 120, protein: 1,  carbs: 30, fat: 0 },
          { name: 'Energy Bar',           quantity: '1 bar',    calories: 200, protein: 5,  carbs: 38, fat: 5 },
        ]},
        { mealType: 'Lunch', totalCalories: Math.round(dailyCalories * 0.35), foods: [
          { name: 'Pasta with Tomato Sauce', quantity: '200g cooked', calories: 320, protein: 11, carbs: 64, fat: 2 },
          { name: 'Grilled Chicken',      quantity: '150g',     calories: 250, protein: 46, carbs: 0,  fat: 5 },
          { name: 'Mixed Salad',          quantity: '1 bowl',   calories: 50,  protein: 2,  carbs: 8,  fat: 1 },
        ]},
        { mealType: 'Dinner', totalCalories: Math.round(dailyCalories * 0.30), foods: [
          { name: 'Brown Rice',           quantity: '150g dry', calories: 200, protein: 4,  carbs: 44, fat: 2 },
          { name: 'Grilled Salmon',       quantity: '180g',     calories: 350, protein: 40, carbs: 0,  fat: 20 },
          { name: 'Steamed Vegetables',   quantity: '200g',     calories: 70,  protein: 4,  carbs: 14, fat: 0 },
        ]},
      ],
      restrictions: ['Stay hydrated — 3L+ water/day', 'Carb-load before long sessions', 'Avoid heavy meals 2hrs before training'],
    },
    general_fitness: {
      title: 'AI Balanced Diet',
      description: `Balanced nutrition plan (BMI: ${bmiCategory}). Target: ${dailyCalories} kcal/day. ${macroNote}.`,
      dailyCalories,
      meals: [
        { mealType: 'Breakfast', totalCalories: Math.round(dailyCalories * 0.25), foods: [
          { name: 'Whole Grain Cereal',   quantity: '60g',      calories: 220, protein: 6,  carbs: 44, fat: 3 },
          { name: 'Low-fat Milk',         quantity: '250ml',    calories: 110, protein: 8,  carbs: 12, fat: 3 },
          { name: 'Mixed Fruits',         quantity: '1 bowl',   calories: 120, protein: 1,  carbs: 30, fat: 0 },
        ]},
        { mealType: 'Lunch', totalCalories: Math.round(dailyCalories * 0.35), foods: [
          { name: 'Grilled Chicken',      quantity: '160g',     calories: 265, protein: 50, carbs: 0,  fat: 6 },
          { name: 'Brown Rice',           quantity: '100g dry', calories: 130, protein: 3,  carbs: 28, fat: 1 },
          { name: 'Steamed Vegetables',   quantity: '150g',     calories: 60,  protein: 3,  carbs: 12, fat: 0 },
          { name: 'Olive Oil',            quantity: '5ml',      calories: 45,  protein: 0,  carbs: 0,  fat: 5 },
        ]},
        { mealType: 'Snack', totalCalories: Math.round(dailyCalories * 0.10), foods: [
          { name: 'Mixed Nuts',           quantity: '30g',      calories: 180, protein: 5,  carbs: 6,  fat: 16 },
          { name: 'Apple',                quantity: '1 medium', calories: 80,  protein: 0,  carbs: 21, fat: 0 },
        ]},
        { mealType: 'Dinner', totalCalories: Math.round(dailyCalories * 0.30), foods: [
          { name: 'Baked Fish (Tilapia)', quantity: '180g',     calories: 220, protein: 45, carbs: 0,  fat: 4 },
          { name: 'Quinoa',               quantity: '100g dry', calories: 170, protein: 6,  carbs: 30, fat: 3 },
          { name: 'Mixed Green Salad',    quantity: '1 bowl',   calories: 50,  protein: 2,  carbs: 8,  fat: 1 },
        ]},
      ],
      restrictions: ['Drink 8 glasses of water daily', 'Limit processed foods', 'Eat slowly and mindfully'],
    },
  };
  return plans[goal] || plans.general_fitness;
};

// ─── Food Database ───────────────────────────────────────────────────────────
const FOOD_DATABASE = [
  // Proteins
  { id: 'chicken_breast',   name: 'Chicken Breast',      category: 'Protein',  per100g: { calories: 165, protein: 31, carbs: 0,  fat: 3.6 } },
  { id: 'beef_steak',       name: 'Beef Steak',          category: 'Protein',  per100g: { calories: 200, protein: 26, carbs: 0,  fat: 10  } },
  { id: 'salmon',           name: 'Salmon',              category: 'Protein',  per100g: { calories: 208, protein: 20, carbs: 0,  fat: 13  } },
  { id: 'tuna',             name: 'Tuna (canned)',        category: 'Protein',  per100g: { calories: 116, protein: 26, carbs: 0,  fat: 1   } },
  { id: 'eggs',             name: 'Eggs',                category: 'Protein',  per100g: { calories: 155, protein: 13, carbs: 1,  fat: 11  } },
  { id: 'whey_protein',     name: 'Whey Protein',        category: 'Protein',  per100g: { calories: 400, protein: 80, carbs: 10, fat: 5   } },
  { id: 'greek_yogurt',     name: 'Greek Yogurt',        category: 'Protein',  per100g: { calories: 59,  protein: 10, carbs: 3,  fat: 0.4 } },
  { id: 'cottage_cheese',   name: 'Cottage Cheese',      category: 'Protein',  per100g: { calories: 98,  protein: 11, carbs: 3,  fat: 4   } },
  { id: 'tilapia',          name: 'Tilapia',             category: 'Protein',  per100g: { calories: 128, protein: 26, carbs: 0,  fat: 3   } },
  { id: 'turkey_breast',    name: 'Turkey Breast',       category: 'Protein',  per100g: { calories: 135, protein: 30, carbs: 0,  fat: 1   } },
  // Carbs
  { id: 'white_rice',       name: 'White Rice',          category: 'Carbs',    per100g: { calories: 130, protein: 2,  carbs: 28, fat: 0.3 } },
  { id: 'brown_rice',       name: 'Brown Rice',          category: 'Carbs',    per100g: { calories: 112, protein: 2,  carbs: 24, fat: 0.9 } },
  { id: 'oats',             name: 'Oats',                category: 'Carbs',    per100g: { calories: 389, protein: 17, carbs: 66, fat: 7   } },
  { id: 'sweet_potato',     name: 'Sweet Potato',        category: 'Carbs',    per100g: { calories: 86,  protein: 2,  carbs: 20, fat: 0.1 } },
  { id: 'pasta',            name: 'Pasta',               category: 'Carbs',    per100g: { calories: 131, protein: 5,  carbs: 25, fat: 1   } },
  { id: 'bread_ww',         name: 'Whole Wheat Bread',   category: 'Carbs',    per100g: { calories: 247, protein: 13, carbs: 41, fat: 4   } },
  { id: 'quinoa',           name: 'Quinoa',              category: 'Carbs',    per100g: { calories: 120, protein: 4,  carbs: 21, fat: 2   } },
  { id: 'banana',           name: 'Banana',              category: 'Carbs',    per100g: { calories: 89,  protein: 1,  carbs: 23, fat: 0.3 } },
  { id: 'apple',            name: 'Apple',               category: 'Carbs',    per100g: { calories: 52,  protein: 0,  carbs: 14, fat: 0.2 } },
  { id: 'potato',           name: 'Potato',              category: 'Carbs',    per100g: { calories: 77,  protein: 2,  carbs: 17, fat: 0.1 } },
  // Fats
  { id: 'avocado',          name: 'Avocado',             category: 'Fats',     per100g: { calories: 160, protein: 2,  carbs: 9,  fat: 15  } },
  { id: 'almonds',          name: 'Almonds',             category: 'Fats',     per100g: { calories: 579, protein: 21, carbs: 22, fat: 50  } },
  { id: 'olive_oil',        name: 'Olive Oil',           category: 'Fats',     per100g: { calories: 884, protein: 0,  carbs: 0,  fat: 100 } },
  { id: 'peanut_butter',    name: 'Peanut Butter',       category: 'Fats',     per100g: { calories: 588, protein: 25, carbs: 20, fat: 50  } },
  { id: 'walnuts',          name: 'Walnuts',             category: 'Fats',     per100g: { calories: 654, protein: 15, carbs: 14, fat: 65  } },
  // Vegetables
  { id: 'broccoli',         name: 'Broccoli',            category: 'Veggies', per100g: { calories: 34,  protein: 3,  carbs: 7,  fat: 0.4 } },
  { id: 'spinach',          name: 'Spinach',             category: 'Veggies', per100g: { calories: 23,  protein: 3,  carbs: 4,  fat: 0.4 } },
  { id: 'mixed_veg',        name: 'Mixed Vegetables',    category: 'Veggies', per100g: { calories: 65,  protein: 3,  carbs: 13, fat: 0.5 } },
  { id: 'tomato',           name: 'Tomato',              category: 'Veggies', per100g: { calories: 18,  protein: 1,  carbs: 4,  fat: 0.2 } },
  { id: 'cucumber',         name: 'Cucumber',            category: 'Veggies', per100g: { calories: 15,  protein: 1,  carbs: 4,  fat: 0.1 } },
  // Dairy
  { id: 'milk',             name: 'Milk (whole)',         category: 'Dairy',   per100g: { calories: 61,  protein: 3,  carbs: 5,  fat: 3   } },
  { id: 'cheese',           name: 'Cheddar Cheese',      category: 'Dairy',   per100g: { calories: 402, protein: 25, carbs: 1,  fat: 33  } },
];

// Build a custom diet plan from selected foods + macro targets
const generateCustomDietPlan = (selectedFoods, goal, bmiCategory, dailyCalories) => {
  const macros = calcMacros(dailyCalories, goal);
  const macroNote = `Daily targets — Protein: ${macros.protein}g | Carbs: ${macros.carbs}g | Fat: ${macros.fat}g`;

  // Categorise selected foods
  const byId = (ids) => selectedFoods.filter(f => ids.includes(f.id));
  const byCategory = (cat) => selectedFoods.filter(f => f.category === cat);

  // Breakfast-friendly foods (light proteins + carbs + dairy)
  const breakfastProteins = byId(['eggs', 'greek_yogurt', 'cottage_cheese', 'whey_protein']);
  const breakfastCarbs    = byId(['oats', 'bread_ww', 'banana', 'apple']);
  const breakfastDairy    = byCategory('Dairy');

  // Lunch/Dinner proteins (heavier meats & fish)
  const mealProteins = byId(['chicken_breast', 'beef_steak', 'salmon', 'tuna', 'tilapia', 'turkey_breast']);
  const mealCarbs    = byId(['white_rice', 'brown_rice', 'sweet_potato', 'pasta', 'quinoa', 'potato']);
  const veggies      = byCategory('Veggies');
  const fats         = byCategory('Fats');

  // Snack-friendly foods
  const snackFoods = byId(['almonds', 'walnuts', 'peanut_butter', 'greek_yogurt', 'apple', 'banana', 'cottage_cheese']);

  // Fallbacks — if specific category empty, use whatever is available
  const anyProtein = selectedFoods.filter(f => f.category === 'Protein');
  const anyCarb    = selectedFoods.filter(f => f.category === 'Carbs');

  const pick = (arr, i = 0) => arr.length ? arr[i % arr.length] : null;

  const buildFood = (food, grams) => ({
    name: food.name,
    quantity: `${grams}g`,
    calories: Math.round(food.per100g.calories * grams / 100),
    protein:  Math.round(food.per100g.protein  * grams / 100),
    carbs:    Math.round(food.per100g.carbs    * grams / 100),
    fat:      Math.round(food.per100g.fat      * grams / 100),
  });

  if (selectedFoods.length === 0) return null;

  const meals = [
    {
      mealType: 'Breakfast',
      foods: [
        // Breakfast: eggs/yogurt/oats — NOT chicken or steak
        ...(pick(breakfastCarbs)    ? [buildFood(pick(breakfastCarbs), 80)]    : pick(anyCarb)    ? [buildFood(pick(anyCarb), 60)]    : []),
        ...(pick(breakfastProteins) ? [buildFood(pick(breakfastProteins), 120)] : []),
        ...(pick(breakfastDairy)    ? [buildFood(pick(breakfastDairy), 150)]   : []),
        ...(pick(fats)              ? [buildFood(pick(fats), 15)]              : []),
      ].filter(Boolean)
    },
    {
      mealType: 'Lunch',
      foods: [
        // Lunch: proper meal protein + carb + veggie
        ...(pick(mealProteins)  ? [buildFood(pick(mealProteins), 180)]  : pick(anyProtein) ? [buildFood(pick(anyProtein), 150)] : []),
        ...(pick(mealCarbs)     ? [buildFood(pick(mealCarbs), 120)]     : pick(anyCarb)    ? [buildFood(pick(anyCarb), 100)]   : []),
        ...(pick(veggies)       ? [buildFood(pick(veggies), 150)]       : []),
        ...(pick(fats)          ? [buildFood(pick(fats, 1), 10)]        : []),
      ].filter(Boolean)
    },
    {
      mealType: 'Snack',
      foods: [
        // Snack: nuts, yogurt, fruit — light
        ...(pick(snackFoods)    ? [buildFood(pick(snackFoods), 40)]     : pick(anyCarb)    ? [buildFood(pick(anyCarb, 1), 80)]  : []),
        ...(snackFoods.length > 1 ? [buildFood(pick(snackFoods, 1), 100)] : []),
      ].filter(Boolean)
    },
    {
      mealType: 'Dinner',
      foods: [
        // Dinner: different protein from lunch + carb + veggie
        ...(mealProteins.length > 1 ? [buildFood(pick(mealProteins, 1), 200)] : pick(mealProteins) ? [buildFood(pick(mealProteins), 200)] : pick(anyProtein) ? [buildFood(pick(anyProtein, 1), 180)] : []),
        ...(mealCarbs.length > 1    ? [buildFood(pick(mealCarbs, 1), 130)]    : pick(mealCarbs)    ? [buildFood(pick(mealCarbs), 130)]    : pick(anyCarb)    ? [buildFood(pick(anyCarb, 1), 100)]  : []),
        ...(veggies.length > 1      ? [buildFood(pick(veggies, 1), 150)]      : pick(veggies)      ? [buildFood(pick(veggies), 150)]      : []),
      ].filter(Boolean)
    },
  ].map(meal => ({
    ...meal,
    totalCalories: meal.foods.reduce((s, f) => s + f.calories, 0),
  }));

  return {
    title: 'My Custom Diet Plan',
    description: `Custom plan built from your selected foods (BMI: ${bmiCategory}). Target: ${dailyCalories} kcal/day. ${macroNote}.`,
    dailyCalories,
    goal,
    meals,
    restrictions: ['Based on your available foods', 'Adjust quantities to hit daily calorie target'],
  };
};

module.exports = { calcBMI, getBMICategory, calcCalories, calcMacros, generateWorkoutPlan, generateDietPlan, generateCustomDietPlan, determineLevel, FOOD_DATABASE };
