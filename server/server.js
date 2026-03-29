import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirnameSelf = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirnameSelf, '..', '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';

import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/uploads.js';
import quizRoutes from './routes/quizzes.js';
import reviewRoutes from './routes/reviews.js';
import statsRoutes from './routes/stats.js';
import subscriptionRoutes from './routes/subscription.js';

// Connect to MongoDB
await connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// --------------- Middleware ---------------
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen, bitte später erneut versuchen' },
});
app.use('/api/', limiter);

// --------------- Static files ---------------
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirnameSelf, 'uploads');
app.use('/uploads', express.static(uploadDir));

// --------------- Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/subscription', subscriptionRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- Error handling ---------------
app.use(errorHandler);

// --------------- Start ---------------
app.listen(PORT, () => {
  console.log(`[server] SnapLearn API running on http://localhost:${PORT}`);
});

export default app;
