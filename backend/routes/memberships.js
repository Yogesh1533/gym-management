const express = require('express');
const router = express.Router();
const { getPlans, getAllPlans, createPlan, updatePlan, deletePlan, assignPlan, getMyMembership, subscribe, cancelMembership, getMyPayments } = require('../controllers/membershipController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/public', getPlans);                          // public — no auth
router.get('/my', protect, getMyMembership);              // member
router.post('/subscribe', protect, subscribe);            // member (demo checkout)
router.post('/cancel', protect, cancelMembership);        // member
router.get('/payments', protect, getMyPayments);          // member
router.get('/', protect, adminOnly, getAllPlans);          // admin
router.post('/', protect, adminOnly, createPlan);         // admin
router.put('/:id', protect, adminOnly, updatePlan);       // admin
router.delete('/:id', protect, adminOnly, deletePlan);    // admin
router.post('/assign', protect, adminOnly, assignPlan);   // admin

module.exports = router;
