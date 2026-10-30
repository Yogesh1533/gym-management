const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { createLead } = require('../controllers/leadController');

const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', leadLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional({ values: 'falsy' }).isLength({ max: 30 }),
  body('goal').optional({ values: 'falsy' }).isLength({ max: 50 }),
  body('message').optional({ values: 'falsy' }).isLength({ max: 1000 }).withMessage('Message is too long'),
  validate,
], createLead);

module.exports = router;
