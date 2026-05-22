const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { isActive: true, date: { [Op.gte]: new Date() } },
      order: [['date', 'ASC']]
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

module.exports = router;
