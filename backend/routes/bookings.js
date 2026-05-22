const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, getMyWaitlist, leaveWaitlist } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/waitlist', protect, getMyWaitlist);
router.put('/:id/cancel', protect, cancelBooking);
router.delete('/waitlist/:id', protect, leaveWaitlist);

module.exports = router;
