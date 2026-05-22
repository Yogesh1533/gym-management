const Rating = require('../models/Rating');
const Booking = require('../models/Booking');
const Session = require('../models/Session');
const User = require('../models/User');
const { Op } = require('sequelize');

const rateSession = async (req, res) => {
  try {
    const { sessionId, rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const booking = await Booking.findOne({
      where: { memberId: req.user.id, sessionId, status: { [Op.in]: ['confirmed', 'attended'] } }
    });
    if (!booking) return res.status(403).json({ message: 'You can only rate sessions you have booked' });

    const [r, created] = await Rating.findOrCreate({
      where: { memberId: req.user.id, sessionId },
      defaults: { rating, review }
    });
    if (!created) { r.rating = rating; r.review = review; await r.save(); }

    res.json(r);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit rating' });
  }
};

const getSessionRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { sessionId: req.params.id },
      include: [{ model: User, as: 'member', attributes: ['name'] }]
    });
    const avg = ratings.length
      ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
      : null;
    res.json({ ratings, avg, count: ratings.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ratings' });
  }
};

const getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({ where: { memberId: req.user.id } });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ratings' });
  }
};

module.exports = { rateSession, getSessionRatings, getMyRatings };
