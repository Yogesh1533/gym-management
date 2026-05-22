const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, changePassword,
  generatePlan, getFoods, generateCustomPlan,
  logWeight, getWeightLogs
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateWeightLog } = require('../middleware/validate');

router.get('/profile',          protect, getProfile);
router.put('/profile',          protect, updateProfile);
router.put('/change-password',  protect, changePassword);
router.post('/generate-plan',   protect, generatePlan);
router.get('/foods',            protect, getFoods);
router.post('/generate-custom-plan', protect, generateCustomPlan);
router.post('/weight-log',      protect, validateWeightLog, logWeight);
router.get('/weight-log',       protect, getWeightLogs);

module.exports = router;
