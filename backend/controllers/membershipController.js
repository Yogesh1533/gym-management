const { Op } = require('sequelize');
const MembershipPlan = require('../models/MembershipPlan');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const addPeriod = (cycle) => {
  const d = new Date();
  if (cycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

// Demo checkout: records a payment and activates the plan. No card is charged or stored.
const subscribe = async (req, res) => {
  try {
    const plan = await MembershipPlan.findOne({ where: { id: req.body.planId, isActive: true } });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    if (req.user.membershipPlanId === plan.id)
      return res.status(400).json({ message: `You are already on the ${plan.name} plan` });

    const periodEnd = addPeriod(plan.billingCycle);
    const reference = `PYF-${Date.now().toString(36).toUpperCase()}-${req.user.id}`;
    const payment = await Payment.create({
      userId: req.user.id, membershipPlanId: plan.id, amount: plan.price, reference, periodEnd
    });
    await User.update({ membershipPlanId: plan.id, membershipRenewsAt: periodEnd }, { where: { id: req.user.id } });
    await Notification.create({
      recipientId: req.user.id,
      title: `Welcome to ${plan.name}!`,
      message: `Your ${plan.name} membership is active until ${periodEnd}. Receipt ${reference}.`,
      type: 'general'
    });
    res.status(201).json({ message: `${plan.name} membership activated`, payment, plan, renewsAt: periodEnd });
  } catch (err) { res.status(500).json({ message: 'Checkout failed. Please try again.' }); }
};

const cancelMembership = async (req, res) => {
  try {
    if (!req.user.membershipPlanId) return res.status(400).json({ message: 'You have no active membership' });
    await User.update({ membershipPlanId: null, membershipRenewsAt: null }, { where: { id: req.user.id } });
    res.json({ message: 'Membership cancelled' });
  } catch (err) { res.status(500).json({ message: 'Failed to cancel membership' }); }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      include: [{ model: MembershipPlan, as: 'plan', attributes: ['name', 'tier', 'billingCycle'] }],
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: 'Failed to fetch payments' }); }
};

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
        where: { memberId: req.user.id, status: { [Op.ne]: 'cancelled' }, createdAt: { [Op.gte]: startOfMonth } }
      });
      sessionsRemaining = Math.max(0, plan.sessionLimit - sessionsUsed);
    }
    res.json({ plan, sessionsUsed, sessionsRemaining, renewsAt: user.membershipRenewsAt });
  } catch (err) { res.status(500).json({ message: 'Failed to fetch membership' }); }
};

module.exports = { getPlans, getAllPlans, createPlan, updatePlan, deletePlan, assignPlan, getMyMembership, subscribe, cancelMembership, getMyPayments };
