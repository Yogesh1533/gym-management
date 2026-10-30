const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

// Public: this week's classes for the website (no member data)
router.get('/public', async (req, res) => {
  try {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 7);
    const sessions = await Session.findAll({
      where: {
        isActive: true,
        date: { [Op.between]: [today.toISOString().split('T')[0], end.toISOString().split('T')[0]] }
      },
      attributes: ['id', 'title', 'trainer', 'sessionType', 'date', 'startTime', 'endTime', 'location', 'totalSlots', 'bookedSlots'],
      order: [['date', 'ASC'], ['startTime', 'ASC']],
      limit: 12
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { isActive: true, date: { [Op.gte]: new Date().toISOString().split('T')[0] } },
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

module.exports = router;
