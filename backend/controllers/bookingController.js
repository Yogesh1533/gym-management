const Booking = require('../models/Booking');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const Waitlist = require('../models/Waitlist');

const { Op } = require('sequelize');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');

const todayStr = () => new Date().toISOString().split('T')[0];

// Returns an error message if the member's plan does not allow another booking this month
const checkMembershipLimit = async (memberId) => {
  const user = await User.findByPk(memberId, {
    include: [{ model: MembershipPlan, as: 'membershipPlan', required: false }]
  });
  const plan = user?.membershipPlan;
  if (!plan || plan.sessionLimit === -1) return null;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const used = await Booking.count({
    where: { memberId, status: { [Op.ne]: 'cancelled' }, createdAt: { [Op.gte]: startOfMonth } }
  });
  if (used >= plan.sessionLimit)
    return `Your ${plan.name} plan allows ${plan.sessionLimit} bookings per month. Upgrade your membership to book more.`;
  return null;
};

const createBooking = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findByPk(sessionId);
    if (!session || !session.isActive) return res.status(404).json({ message: 'Session not found' });
    if (session.date < todayStr()) return res.status(400).json({ message: 'This session has already taken place' });

    const existing = await Booking.findOne({ where: { memberId: req.user.id, sessionId } });
    if (existing && existing.status !== 'cancelled')
      return res.status(400).json({ message: 'You already booked this session' });

    const limitError = await checkMembershipLimit(req.user.id);
    if (limitError) return res.status(403).json({ message: limitError });

    // Session full — add to waitlist
    if (session.bookedSlots >= session.totalSlots) {
      const onWaitlist = await Waitlist.findOne({ where: { memberId: req.user.id, sessionId } });
      if (onWaitlist) return res.status(400).json({ message: 'You are already on the waitlist' });
      await Waitlist.create({ memberId: req.user.id, sessionId });
      await Notification.create({
        recipientId: req.user.id,
        title: 'Added to Waitlist',
        message: `"${session.title}" is full. You've been added to the waitlist. We'll notify you if a spot opens up!`,
        type: 'general',
        relatedSessionId: session.id
      });
      return res.status(200).json({ waitlisted: true, message: 'Session is full. You have been added to the waitlist.' });
    }

    // Re-booking a previously cancelled session reuses the old row (memberId+sessionId is unique)
    let booking;
    if (existing) {
      existing.status = 'confirmed';
      booking = await existing.save();
    } else {
      booking = await Booking.create({ memberId: req.user.id, sessionId });
    }
    await session.increment('bookedSlots');

    await Notification.create({
      recipientId: req.user.id,
      title: 'Booking Confirmed!',
      message: `Your booking for "${session.title}" on ${session.date} at ${session.startTime} with ${session.trainer} is confirmed.`,
      type: 'booking_confirmed',
      relatedSessionId: session.id
    });

    const populated = await Booking.findByPk(booking.id, {
      include: [{ model: Session, as: 'session', attributes: ['id', 'title', 'date', 'startTime', 'endTime', 'trainer', 'location'] }]
    });
    res.status(201).json(populated);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Already booked this session' });
    res.status(500).json({ message: 'Booking failed. Please try again.' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { memberId: req.user.id },
      include: [{ model: Session, as: 'session', attributes: ['id', 'title', 'date', 'startTime', 'endTime', 'trainer', 'location', 'sessionType'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  const { sequelize } = require('../config/db');
  const t = await sequelize.transaction();
  try {
    const booking = await Booking.findOne({ where: { id: req.params.id, memberId: req.user.id }, transaction: t });
    if (!booking) { await t.rollback(); return res.status(404).json({ message: 'Booking not found' }); }
    if (booking.status === 'cancelled') { await t.rollback(); return res.status(400).json({ message: 'Already cancelled' }); }
    if (booking.status === 'attended') { await t.rollback(); return res.status(400).json({ message: 'Attended sessions cannot be cancelled' }); }

    booking.status = 'cancelled';
    await booking.save({ transaction: t });
    await Session.decrement('bookedSlots', { where: { id: booking.sessionId }, transaction: t });

    // Auto-promote first person on waitlist
    const next = await Waitlist.findOne({
      where: { sessionId: booking.sessionId },
      order: [['createdAt', 'ASC']],
      transaction: t
    });
    if (next) {
      const session = await Session.findByPk(booking.sessionId, { transaction: t });
      const previous = await Booking.findOne({ where: { memberId: next.memberId, sessionId: booking.sessionId }, transaction: t });
      if (previous) {
        previous.status = 'confirmed';
        await previous.save({ transaction: t });
      } else {
        await Booking.create({ memberId: next.memberId, sessionId: booking.sessionId }, { transaction: t });
      }
      await session.increment('bookedSlots', { transaction: t });
      await Waitlist.destroy({ where: { id: next.id }, transaction: t });
      await Notification.create({
        recipientId: next.memberId,
        title: '🎉 Spot Available!',
        message: `A spot opened up for "${session.title}" on ${session.date} at ${session.startTime}. You've been automatically booked!`,
        type: 'booking_confirmed',
        relatedSessionId: session.id
      }, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

const getMyWaitlist = async (req, res) => {
  try {
    const waitlist = await Waitlist.findAll({
      where: { memberId: req.user.id },
      include: [{ model: Session, as: 'session', attributes: ['id', 'title', 'date', 'startTime', 'trainer', 'location'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(waitlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const leaveWaitlist = async (req, res) => {
  try {
    await Waitlist.destroy({ where: { id: req.params.id, memberId: req.user.id } });
    res.json({ message: 'Removed from waitlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking, getMyWaitlist, leaveWaitlist };
