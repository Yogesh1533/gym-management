const jwt = require('jsonwebtoken');
const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');

const { getWorkoutPlanWithSchedule, getDietPlanWithMeals } = require('../utils/planHelper');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const register = async (req, res) => {
  try {
    const { name, email, password, phone, fitnessGoal } = req.body;
    const age    = req.body.age    ? parseFloat(req.body.age)    : null;
    const weight = req.body.weight ? parseFloat(req.body.weight) : null;
    const height = req.body.height ? parseFloat(req.body.height) : null;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    if (await User.findOne({ where: { email: email.toLowerCase() } }))
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || null,
      age, weight, height,
      fitnessGoal: fitnessGoal || 'general_fitness'
    });

    res.status(201).json({
      token: generateToken(user.id),
      user: { _id: user.id, id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [
        { model: WorkoutPlan, as: 'workoutPlan', required: false },
        { model: DietPlan,    as: 'dietPlan',    required: false }
      ]
    });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });

    const loginUser = {
      _id: user.id, id: user.id, name: user.name, email: user.email,
      role: user.role, phone: user.phone, age: user.age,
      weight: user.weight, height: user.height, fitnessGoal: user.fitnessGoal,
      workoutPlanId: user.workoutPlanId, dietPlanId: user.dietPlanId,
      workoutPlan: user.workoutPlanId ? await getWorkoutPlanWithSchedule(user.workoutPlanId) : null,
      dietPlan:    user.dietPlanId    ? await getDietPlanWithMeals(user.dietPlanId)           : null,
    };

    res.json({ token: generateToken(user.id), user: loginUser });
  } catch (err) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

const getMe = async (req, res) => {
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
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
};

module.exports = { register, login, getMe };
