require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

let swaggerDocument = {};
try {
  swaggerDocument = require('./swagger-output.json');
} catch (err) {
  console.log('Swagger documentation not found. Run `npm run swagger` to generate it.');
}

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();

// ── CORS Middleware ────────────────────────────────────────────────
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://www.powerflexind.com',
  'https://powerflexind.com',
  'http://www.powerflexind.com',
  'http://powerflexind.com'
];
const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/$/, ''))
  : [];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // Dynamically allow the origin
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (product images, enquiry drawings, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Root Route ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Powerflex API is running', endpoints: ['/api', '/api/admin', '/api-docs'] });
});

// ── Swagger UI ────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── Routes ────────────────────────────────────────────────────────
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Powerflex API running on http://localhost:${PORT}`);
  console.log(`Swagger Docs running on http://localhost:${PORT}/api-docs`);
});
