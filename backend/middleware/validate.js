const { body, validationResult } = require('express-validator');

// Middleware to return validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').optional({ values: 'falsy' }).isInt({ min: 10, max: 120 }).withMessage('Invalid age'),
  body('weight').optional({ values: 'falsy' }).isFloat({ min: 20, max: 500 }).withMessage('Invalid weight'),
  body('height').optional({ values: 'falsy' }).isFloat({ min: 50, max: 300 }).withMessage('Invalid height'),
  validate,
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const validateWeightLog = [
  body('weight').isFloat({ min: 20, max: 500 }).withMessage('Invalid weight value'),
  validate,
];

const validateNotification = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 }),
  validate,
];

module.exports = { validateRegister, validateLogin, validateWeightLog, validateNotification, validate };
