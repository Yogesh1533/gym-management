const { Op } = require('sequelize');
const User           = require('../models/User');
const WorkoutPlan    = require('../models/WorkoutPlan');
const DietPlan       = require('../models/DietPlan');
const Session        = require('../models/Session');
const Booking        = require('../models/Booking');
const Notification   = require('../models/Notification');
const MembershipPlan = require('../models/MembershipPlan');
const {
  saveWorkoutPlan, getWorkoutPlanWithSchedule, deleteWorkoutSchedule,
  saveDietPlan, getDietPlanWithMeals, deleteDietMeals
} = require('../utils/planHelper');

const handleError = (res, err, status = 500) =>
  res.status(status).json({ message: err.message || 'Server error' });

// ─── MEMBERS ────────────────────────────────────────────────────────────────

const getMembers = async (req, res) => {
  try {
    const members = await User.findAll({
      where: { role: 'member' },
      attributes: { exclude: ['password'] },
      include: [
        { model: WorkoutPlan,    as: 'workoutPlan',    attributes: ['id', 'title'], required: false },
        { model: DietPlan,       as: 'dietPlan',       attributes: ['id', 'title'], required: false },
        { model: MembershipPlan, as: 'membershipPlan', attributes: ['id', 'name', 'tier'], required: false }
      ]
    });
    res.json(members);
  } catch (err) { handleError(res, err); }
};

const getMemberById = async (req, res) => {
  try {
    const member = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: WorkoutPlan, as: 'workoutPlan', required: false },
        { model: DietPlan,    as: 'dietPlan',    required: false }
      ]
    });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) { handleError(res, err); }
};

const updateMember = async (req, res) => {
  try {
    const { name, email, phone, age, weight, height, fitnessGoal, isActive, workoutPlan, dietPlan } = req.body;
    const updateData = {};
    if (name      !== undefined) updateData.name        = name;
    if (email     !== undefined) updateData.email       = email;
    if (phone     !== undefined) updateData.phone       = phone;
    if (age       !== undefined) updateData.age         = age       ? parseInt(age)       : null;
    if (weight    !== undefined) updateData.weight      = weight    ? parseFloat(weight)  : null;
    if (height    !== undefined) updateData.height      = height    ? parseFloat(height)  : null;
    if (fitnessGoal !== undefined) updateData.fitnessGoal = fitnessGoal;
    if (isActive  !== undefined) updateData.isActive    = isActive;
    if (workoutPlan !== undefined) updateData.workoutPlanId = workoutPlan ? parseInt(workoutPlan) : null;
    if (dietPlan  !== undefined) updateData.dietPlanId  = dietPlan  ? parseInt(dietPlan)  : null;

    const target = await User.findOne({ where: { id: req.params.id, role: 'member' } });
    if (!target) return res.status(404).json({ message: 'Member not found' });
    await target.update(updateData);
    if (workoutPlan || dietPlan) {
      await Notification.create({
        recipientId: req.params.id,
        title: 'New Plan Assigned',
        message: 'Your trainer has assigned you a new workout or diet plan. Check your dashboard!',
        type: 'plan_assigned'
      });
    }
    const member = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: WorkoutPlan, as: 'workoutPlan', attributes: ['id', 'title'], required: false },
        { model: DietPlan,    as: 'dietPlan',    attributes: ['id', 'title'], required: false }
      ]
    });
    res.json(member);
  } catch (err) { handleError(res, err, 400); }
};

const deleteMember = async (req, res) => {
  try {
    const member = await User.findOne({ where: { id: req.params.id, role: 'member' } });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    const Waitlist  = require('../models/Waitlist');
    const Rating    = require('../models/Rating');
    const WeightLog = require('../models/WeightLog');
    // Free up the slots this member was holding in upcoming sessions
    const active = await Booking.findAll({ where: { memberId: member.id, status: 'confirmed' } });
    for (const b of active) await Session.decrement('bookedSlots', { where: { id: b.sessionId } });
    await Promise.all([
      Booking.destroy({ where: { memberId: member.id } }),
      Waitlist.destroy({ where: { memberId: member.id } }),
      Rating.destroy({ where: { memberId: member.id } }),
      WeightLog.destroy({ where: { userId: member.id } }),
      Notification.destroy({ where: { recipientId: member.id } }),
    ]);
    await member.destroy();
    res.json({ message: 'Member deleted' });
  } catch (err) { handleError(res, err); }
};

// ─── WORKOUT PLANS ──────────────────────────────────────────────────────────

const getWorkoutPlans = async (req, res) => {
  try {
    const plans = await WorkoutPlan.findAll({
      include: [{ model: User, as: 'creator', attributes: ['name'], required: false }]
    });
    const formatted = await Promise.all(plans.map(p => getWorkoutPlanWithSchedule(p.id)));
    res.json(formatted);
  } catch (err) { handleError(res, err); }
};

const createWorkoutPlan = async (req, res) => {
  try {
    const plan = await saveWorkoutPlan(req.body, req.user.id);
    res.status(201).json(plan);
  } catch (err) { handleError(res, err, 400); }
};

const updateWorkoutPlan = async (req, res) => {
  try {
    const { schedule, ...fields } = req.body;
    await WorkoutPlan.update(fields, { where: { id: req.params.id } });
    if (schedule) {
      await deleteWorkoutSchedule(req.params.id);
      const WorkoutDay      = require('../models/WorkoutDay');
      const WorkoutExercise = require('../models/WorkoutExercise');
      for (let i = 0; i < schedule.length; i++) {
        const d = schedule[i];
        const day = await WorkoutDay.create({ workoutPlanId: req.params.id, day: d.day, focus: d.focus, order: i });
        if (d.exercises) {
          await WorkoutExercise.bulkCreate(d.exercises.map((ex, j) => ({
            workoutDayId: day.id, name: ex.name, sets: ex.sets || null,
            reps: ex.reps || null, duration: ex.duration || null, notes: ex.notes || null, order: j
          })));
        }
      }
    }
    const plan = await getWorkoutPlanWithSchedule(req.params.id);
    res.json(plan);
  } catch (err) { handleError(res, err, 400); }
};

const deleteWorkoutPlan = async (req, res) => {
  try {
    await deleteWorkoutSchedule(req.params.id);
    await WorkoutPlan.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Workout plan deleted' });
  } catch (err) { handleError(res, err); }
};

// ─── DIET PLANS ─────────────────────────────────────────────────────────────

const getDietPlans = async (req, res) => {
  try {
    const plans = await DietPlan.findAll({
      include: [{ model: User, as: 'creator', attributes: ['name'], required: false }]
    });
    const formatted = await Promise.all(plans.map(p => getDietPlanWithMeals(p.id)));
    res.json(formatted);
  } catch (err) { handleError(res, err); }
};

const createDietPlan = async (req, res) => {
  try {
    const plan = await saveDietPlan(req.body, req.user.id);
    res.status(201).json(plan);
  } catch (err) { handleError(res, err, 400); }
};

const updateDietPlan = async (req, res) => {
  try {
    const { meals, ...fields } = req.body;
    await DietPlan.update(fields, { where: { id: req.params.id } });
    if (meals) {
      await deleteDietMeals(req.params.id);
      const DietMeal = require('../models/DietMeal');
      const DietFood = require('../models/DietFood');
      for (let i = 0; i < meals.length; i++) {
        const m = meals[i];
        const meal = await DietMeal.create({ dietPlanId: req.params.id, mealType: m.mealType, totalCalories: m.totalCalories || 0, order: i });
        if (m.foods) {
          await DietFood.bulkCreate(m.foods.map((f, j) => ({
            dietMealId: meal.id, name: f.name, quantity: f.quantity || null,
            calories: f.calories || 0, protein: f.protein || 0,
            carbs: f.carbs || 0, fat: f.fat || 0, order: j
          })));
        }
      }
    }
    const plan = await getDietPlanWithMeals(req.params.id);
    res.json(plan);
  } catch (err) { handleError(res, err, 400); }
};

const deleteDietPlan = async (req, res) => {
  try {
    await deleteDietMeals(req.params.id);
    await DietPlan.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Diet plan deleted' });
  } catch (err) { handleError(res, err); }
};

// ─── SESSIONS ───────────────────────────────────────────────────────────────

const getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({ order: [['date', 'ASC']] });
    res.json(sessions);
  } catch (err) { handleError(res, err); }
};

const SESSION_FIELDS = ['title', 'description', 'trainer', 'sessionType', 'date', 'startTime', 'endTime', 'totalSlots', 'location', 'isActive'];
const pickSessionFields = (body) =>
  Object.fromEntries(SESSION_FIELDS.filter(k => body[k] !== undefined).map(k => [k, body[k]]));

const createSession = async (req, res) => {
  try {
    const session = await Session.create({ ...pickSessionFields(req.body), createdBy: req.user.id });
    const members = await User.findAll({ where: { role: 'member', isActive: true } });
    await Notification.bulkCreate(members.map(m => ({
      recipientId: m.id,
      title: 'New Training Session Available!',
      message: `A new session "${session.title}" with ${session.trainer} is available on ${session.date} at ${session.startTime}. Book your spot now!`,
      type: 'new_session',
      relatedSessionId: session.id
    })));
    res.status(201).json(session);
  } catch (err) { handleError(res, err, 400); }
};

const updateSession = async (req, res) => {
  try {
    const existing = await Session.findByPk(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Session not found' });
    const fields = pickSessionFields(req.body);
    if (fields.totalSlots !== undefined && parseInt(fields.totalSlots) < existing.bookedSlots)
      return res.status(400).json({ message: `Total slots cannot be lower than the ${existing.bookedSlots} spots already booked` });
    await existing.update(fields);
    res.json(existing);
  } catch (err) { handleError(res, err, 400); }
};

const deleteSession = async (req, res) => {
  try {
    const Waitlist = require('../models/Waitlist');
    const Rating   = require('../models/Rating');
    const where = { sessionId: req.params.id };
    await Promise.all([Booking.destroy({ where }), Waitlist.destroy({ where }), Rating.destroy({ where })]);
    await Notification.update({ relatedSessionId: null }, { where: { relatedSessionId: req.params.id } });
    await Session.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Session deleted' });
  } catch (err) { handleError(res, err); }
};

// ─── BOOKINGS ───────────────────────────────────────────────────────────────

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User,    as: 'member',  attributes: ['name', 'email'] },
        { model: Session, as: 'session', attributes: ['title', 'date', 'startTime', 'trainer'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (err) { handleError(res, err); }
};

const markAttended = async (req, res) => {
  try {
    await Booking.update({ status: 'attended' }, { where: { id: req.params.id } });
    res.json({ message: 'Marked as attended' });
  } catch (err) { handleError(res, err); }
};

// ─── DASHBOARD STATS ────────────────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
  try {
    const [totalMembers, totalSessions, totalBookings, workoutPlans, dietPlans] = await Promise.all([
      User.count({ where: { role: 'member' } }),
      Session.count(),
      Booking.count(),
      WorkoutPlan.count(),
      DietPlan.count()
    ]);
    const recentBookings = await Booking.findAll({
      include: [
        { model: User,    as: 'member',  attributes: ['name'] },
        { model: Session, as: 'session', attributes: ['title', 'date'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    const upcomingSessions = await Session.findAll({
      where: { date: { [Op.gte]: new Date().toISOString().split('T')[0] } },
      order: [['date', 'ASC'], ['startTime', 'ASC']],
      limit: 5
    });
    res.json({ totalMembers, totalSessions, totalBookings, workoutPlans, dietPlans, recentBookings, upcomingSessions });
  } catch (err) { handleError(res, err); }
};

// ─── SEND NOTIFICATION ──────────────────────────────────────────────────────

const sendNotification = async (req, res) => {
  try {
    const { recipientId, title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });

    if (recipientId === 'all') {
      const members = await User.findAll({ where: { role: 'member', isActive: true } });
      await Notification.bulkCreate(members.map(m => ({ recipientId: m.id, title, message, type: type || 'general' })));
      return res.json({ message: `Notification sent to ${members.length} members` });
    }
    await Notification.create({ recipientId, title, message, type: type || 'general' });
    res.json({ message: 'Notification sent' });
  } catch (err) { handleError(res, err, 400); }
};

module.exports = {
  getMembers, getMemberById, updateMember, deleteMember,
  getWorkoutPlans, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan,
  getDietPlans, createDietPlan, updateDietPlan, deleteDietPlan,
  getSessions, createSession, updateSession, deleteSession,
  getAllBookings, getDashboardStats, sendNotification, markAttended
};
