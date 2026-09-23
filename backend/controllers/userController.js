const User        = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan    = require('../models/DietPlan');
const WeightLog   = require('../models/WeightLog');
const { saveWorkoutPlan, getWorkoutPlanWithSchedule, saveDietPlan, getDietPlanWithMeals } = require('../utils/planHelper');
const { calcBMI, getBMICategory, calcCalories, generateWorkoutPlan, generateDietPlan, generateCustomDietPlan, determineLevel, FOOD_DATABASE } = require('../utils/planGenerator');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: WorkoutPlan, as: 'workoutPlan', required: false },
        { model: DietPlan,    as: 'dietPlan',    required: false }
      ]
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userData = user.toJSON();
    if (userData.workoutPlanId) userData.workoutPlan = await getWorkoutPlanWithSchedule(userData.workoutPlanId);
    if (userData.dietPlanId)    userData.dietPlan    = await getDietPlanWithMeals(userData.dietPlanId);
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, fitnessGoal } = req.body;
    // Empty form fields arrive as '' — store them as null rather than invalid numbers
    const num = (v, parse) => (v === undefined ? undefined : v === '' || v === null ? null : parse(v));
    const age    = num(req.body.age, parseInt);
    const weight = num(req.body.weight, parseFloat);
    const height = num(req.body.height, parseFloat);
    if (name !== undefined && !String(name).trim())
      return res.status(400).json({ message: 'Name is required' });
    if ([age, weight, height].some(v => v !== undefined && v !== null && Number.isNaN(v)))
      return res.status(400).json({ message: 'Age, weight and height must be numbers' });
    await User.update({ name, phone, age, weight, height, fitnessGoal }, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: WorkoutPlan, as: 'workoutPlan', required: false },
        { model: DietPlan,    as: 'dietPlan',    required: false }
      ]
    });
    const userData = user.toJSON();
    if (userData.workoutPlanId) userData.workoutPlan = await getWorkoutPlanWithSchedule(userData.workoutPlanId);
    if (userData.dietPlanId)    userData.dietPlan    = await getDietPlanWithMeals(userData.dietPlanId);
    res.json(userData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Current and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    const user = await User.findByPk(req.user.id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password' });
  }
};

const generatePlan = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { weight, height, age, fitnessGoal } = user;
    const gymDays = parseInt(req.body.gymDays) || 3;

    if (!weight || !height)
      return res.status(400).json({ message: 'Please update your weight and height in your profile first.' });

    if (!age)
      return res.status(400).json({ message: 'Please update your age in your profile first.' });

    const bmi = calcBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);
    const dailyCalories = calcCalories(weight, height, age, fitnessGoal);
    const level = determineLevel(bmiCategory, fitnessGoal);

    const workoutData = generateWorkoutPlan(fitnessGoal, bmiCategory, level, gymDays);
    const dietData = generateDietPlan(fitnessGoal, bmiCategory, dailyCalories, weight);

    const workout = await saveWorkoutPlan(workoutData, req.user.id);
    const diet    = await saveDietPlan({ ...dietData, goal: fitnessGoal }, req.user.id);

    await User.update({ workoutPlanId: workout.id, dietPlanId: diet.id }, { where: { id: req.user.id } });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: WorkoutPlan, as: 'workoutPlan', required: false },
        { model: DietPlan,    as: 'dietPlan',    required: false }
      ]
    });
    // Attach full schedule and meals
    if (updatedUser.workoutPlan) updatedUser.dataValues.workoutPlan = workout;
    if (updatedUser.dietPlan)    updatedUser.dataValues.dietPlan    = diet;

    res.json({ message: `Plan generated! BMI: ${bmi} (${bmiCategory})`, user: updatedUser, bmi, bmiCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFoods = (req, res) => res.json(FOOD_DATABASE);

const logWeight = async (req, res) => {
  try {
    const { weight, note } = req.body;
    if (!weight) return res.status(400).json({ message: 'Weight is required' });
    const log = await WeightLog.create({ userId: req.user.id, weight, note });
    await User.update({ weight }, { where: { id: req.user.id } });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getWeightLogs = async (req, res) => {
  try {
    const logs = await WeightLog.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']],
      limit: 30,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch weight logs' });
  }
};

const generateCustomPlan = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { selectedFoodIds } = req.body;

    if (!user.weight || !user.height)
      return res.status(400).json({ message: 'Please update your weight and height in Profile first.' });

    if (!selectedFoodIds || selectedFoodIds.length === 0)
      return res.status(400).json({ message: 'Please select at least one food.' });

    const bmi = calcBMI(user.weight, user.height);
    const bmiCategory = getBMICategory(bmi);
    const dailyCalories = calcCalories(user.weight, user.height, user.age, user.fitnessGoal);

    const selectedFoods = FOOD_DATABASE.filter(f => selectedFoodIds.includes(f.id));
    const dietData = generateCustomDietPlan(selectedFoods, user.fitnessGoal, bmiCategory, dailyCalories);

    if (!dietData)
      return res.status(400).json({ message: 'Not enough foods selected to build a plan.' });

    const diet = await saveDietPlan({ ...dietData, goal: user.fitnessGoal }, req.user.id);
    await User.update({ dietPlanId: diet.id }, { where: { id: req.user.id } });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: WorkoutPlan, as: 'workoutPlan', required: false },
        { model: DietPlan,    as: 'dietPlan',    required: false }
      ]
    });
    if (updatedUser.dietPlan) updatedUser.dataValues.dietPlan = diet;

    res.json({ message: 'Custom diet plan created!', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword, generatePlan, getFoods, generateCustomPlan, logWeight, getWeightLogs };
