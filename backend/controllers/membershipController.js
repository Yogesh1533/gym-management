const { Op } = require('sequelize');
const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');
const Booking = require('../models/Booking');

const getPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.findAll({ where: { isActive: true }, order: [['price', 'ASC']] });
    res.json(plans);
  } catch (err) { res.status(500).json({ message: 'Failed to fetch plans' }); }
};

const getAllPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.findAll({ order: [['price', 'ASC']] });
    res.json(plans);
  } catch (err) { res.status(500).json({ message: 'Failed to fetch plans' }); }
};

const createPlan = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined) return res.status(400).json({ message: 'Name and price are required' });
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json(plan);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updatePlan = async (req, res) => {
  try {
    await MembershipPlan.update(req.body, { where: { id: req.params.id } });
    const plan = await MembershipPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const deletePlan = async (req, res) => {
  try {
    await MembershipPlan.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Plan deleted' });
  } catch (err) { res.status(500).json({ message: 'Failed to delete plan' }); }
};

const assignPlan = async (req, res) => {
  try {
    const { memberId, planId } = req.body;
    if (!memberId || !planId) return res.status(400).json({ message: 'memberId and planId are required' });
    await User.update({ membershipPlanId: planId }, { where: { id: memberId } });
    res.json({ message: 'Membership plan assigned' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const getMyMembership = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: MembershipPlan, as: 'membershipPlan', required: false }]
    });
    const plan = user.membershipPlan;
    let sessionsUsed = 0;
    let sessionsRemaining = null;

    if (plan && plan.sessionLimit !== -1) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      sessionsUsed = await Booking.count({
        where: { memberId: req.user.id, createdAt: { [Op.gte]: startOfMonth } }
      });
      sessionsRemaining = Math.max(0, plan.sessionLimit - sessionsUsed);
    }
    res.json({ plan, sessionsUsed, sessionsRemaining });
  } catch (err) { res.status(500).json({ message: 'Failed to fetch membership' }); }
};

module.exports = { getPlans, getAllPlans, createPlan, updatePlan, deletePlan, assignPlan, getMyMembership };
