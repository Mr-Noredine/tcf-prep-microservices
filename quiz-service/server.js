import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pool from './config/database.js';

import exercisesRoutes from './routes/exercises.js';
import quizRoutes from './routes/quiz.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      service: 'quiz-service',
      status: 'ok',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      service: 'quiz-service',
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

app.use('/api/exercises', exercisesRoutes);
app.use('/api/quiz', quizRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on quiz-service`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start
app.listen(PORT, () => {
  console.log(`📝 QUIZ-SERVICE running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  console.log('⚠ SIGTERM received: shutting down');
  await pool.end();
  process.exit(0);
});

export default app;
