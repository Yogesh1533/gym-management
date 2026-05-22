const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getMembers, getMemberById, updateMember, deleteMember,
  getWorkoutPlans, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan,
  getDietPlans, createDietPlan, updateDietPlan, deleteDietPlan,
  getSessions, createSession, updateSession, deleteSession,
  getAllBookings, getDashboardStats, sendNotification, markAttended
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);

// Members
router.get('/members', getMembers);
router.get('/members/:id', getMemberById);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

// Workout Plans
router.get('/workout-plans', getWorkoutPlans);
router.post('/workout-plans', createWorkoutPlan);
router.put('/workout-plans/:id', updateWorkoutPlan);
router.delete('/workout-plans/:id', deleteWorkoutPlan);

// Diet Plans
router.get('/diet-plans', getDietPlans);
router.post('/diet-plans', createDietPlan);
router.put('/diet-plans/:id', updateDietPlan);
router.delete('/diet-plans/:id', deleteDietPlan);

// Sessions
router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.put('/sessions/:id', updateSession);
router.delete('/sessions/:id', deleteSession);

// Bookings
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/attend', markAttended);

// Notifications
router.post('/notifications/send', sendNotification);

module.exports = router;
