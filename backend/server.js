require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');

require('./config/associations');

const app = express();

// Trust Railway/Render/Heroku proxy
app.set('trust proxy', 1);

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", "https://pyfitness.netlify.app"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── Prevent parameter pollution ─────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].replace(/[\$\.]/g, '');
      }
    }
  }
  next();
});

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://pyfitness.netlify.app',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [])
];

// Handle OPTIONS preflight explicitly
app.options('*', cors());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─── Connect DB ──────────────────────────────────────────────────────────────
connectDB();

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/sessions',      require('./routes/sessions'));
app.use('/api/ratings',       require('./routes/ratings'));
app.use('/api/memberships',   require('./routes/memberships'));

app.get('/', (req, res) => res.json({ message: 'Gym Management API is running' }));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production')
    console.log(`Server running on port ${PORT}`);
});