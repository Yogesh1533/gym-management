require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB, sequelize } = require('./config/db');

require('./config/associations');

const app = express();

// Trust the reverse proxy in front of the app (Nginx/Caddy on AWS, Railway, Render...)
app.set('trust proxy', 1);

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and set it.');
  process.exit(1);
}

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", "https://pyfitness.netlify.app"],
      // Allow plain-HTTP hosting (e.g. an EC2 IP without a certificate)
      upgradeInsecureRequests: null,
    },
  },
  // Only send HSTS when the site is actually served over HTTPS
  hsts: process.env.ENABLE_HSTS === 'true',
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

app.use('/api', globalLimiter);

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://pyfitness.netlify.app',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [])
];

const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Same-origin requests (frontend served by this server) are always allowed;
// cross-origin requests only from the allow-list above.
const corsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  let sameOrigin = false;
  try { sameOrigin = !!origin && new URL(origin).host === req.get('host'); } catch { /* malformed origin */ }
  const allowed = !origin || sameOrigin || allowedOrigins.includes(origin);
  callback(null, { ...corsOptions, origin: allowed });
};

app.use(cors(corsDelegate));

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/sessions',      require('./routes/sessions'));
app.use('/api/ratings',       require('./routes/ratings'));
app.use('/api/memberships',   require('./routes/memberships'));

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

// ─── Frontend (single-server deployments) ────────────────────────────────────
// When the React build is present, serve it from the same origin as the API so
// no CORS or separate static hosting is needed.
const clientBuild = process.env.CLIENT_BUILD_DIR || path.join(__dirname, '..', 'frontend', 'build');
const serveClient = fs.existsSync(path.join(clientBuild, 'index.html'));

if (serveClient) {
  app.use(express.static(clientBuild, { index: false, maxAge: '7d' }));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.json({ message: 'Gym Management API is running' }));
}

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

const start = async () => {
  await connectDB();
  if (process.env.AUTO_SEED === 'true') {
    const { seedIfEmpty } = require('./config/seed');
    if (await seedIfEmpty()) console.log('Empty database seeded with demo data');
  }
  // Public demos show the admin login on the sign-in page, so optionally restore
  // the demo data on a timer (this also keeps the seeded session dates upcoming).
  const resetHours = parseFloat(process.env.DEMO_RESET_HOURS);
  if (resetHours > 0) {
    const { seedDatabase } = require('./config/seed');
    setInterval(() => {
      seedDatabase()
        .then(() => console.log('Demo data reset'))
        .catch(err => console.error('Demo reset failed:', err.message));
    }, resetHours * 60 * 60 * 1000);
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();