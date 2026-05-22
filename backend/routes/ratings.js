const express = require('express');
const router = express.Router();
const { rateSession, getSessionRatings, getMyRatings } = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, rateSession);
router.get('/my', protect, getMyRatings);
router.get('/session/:id', protect, getSessionRatings);

module.exports = router;
