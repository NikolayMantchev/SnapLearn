// Vercel Serverless Function — env vars are injected by Vercel, no dotenv needed
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from '../server/config/database.js';
import { errorHandler } from '../server/middleware/errorHandler.js';
import authRoutes from '../server/routes/auth.js';
import uploadRoutes from '../server/routes/uploads.js';
import quizRoutes from '../server/routes/quizzes.js';
import reviewRoutes from '../server/routes/reviews.js';
import statsRoutes from '../server/routes/stats.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

// Connect to MongoDB on first request (cached)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
