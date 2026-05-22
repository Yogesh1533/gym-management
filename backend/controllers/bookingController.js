const Booking = require('../models/Booking');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const Waitlist = require('../models/Waitlist');

const createBooking = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findByPk(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const existing = await Booking.findOne({ where: { memberId: req.user.id, sessionId } });
    if (existing) return res.status(400).json({ message: 'You already booked this session' });

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

    const booking = await Booking.create({ memberId: req.user.id, sessionId });
    await session.increment('bookedSlots');

    await Notification.create({
      recipientId: req.user.id,
      title: 'Booking Confirmed!',
      message: `Your booking for "${session.title}" on ${session.date} at ${session.startTime} with ${session.trainer} is confirmed.`,
      type: 'booking_confirmed',
      relatedSessionId: session.id
    });

    const populated = await Booking.findByPk(booking.id, {
      include: [{ model: Session, as: 'session', attributes: ['title', 'date', 'startTime', 'endTime', 'trainer', 'location'] }]
    });
    res.status(201).json(populated);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Already booked this session' });
    res.status(500).json({ message: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { memberId: req.user.id },
      include: [{ model: Session, as: 'session', attributes: ['title', 'date', 'startTime', 'endTime', 'trainer', 'location', 'sessionType'] }],
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
      await Booking.create({ memberId: next.memberId, sessionId: booking.sessionId }, { transaction: t });
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
      include: [{ model: Session, as: 'session', attributes: ['title', 'date', 'startTime', 'trainer', 'location'] }],
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
