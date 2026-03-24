import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';
import QuizAttempt from '../models/QuizAttempt.js';
import ReviewItem from '../models/ReviewItem.js';

const router = Router();

router.get('/overview', authenticate, async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [totalQuizzes, totalAttempts, avgResult, itemsDue, quizzesToday] = await Promise.all([
      QuizAttempt.distinct('quiz_id', { user_id: userId }).then((ids) => ids.length),
      QuizAttempt.countDocuments({ user_id: userId }),
      QuizAttempt.aggregate([
        { $match: { user_id: userId } },
        { $group: { _id: null, avg: { $avg: '$score' } } },
      ]),
      ReviewItem.countDocuments({ user_id: userId, next_review: { $lte: new Date() } }),
      QuizAttempt.countDocuments({
        user_id: userId,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    res.json({
      stats: {
        totalQuizzes,
        totalAttempts,
        avgScore: avgResult[0]?.avg ? Math.round(avgResult[0].avg * 100) / 100 : 0,
        itemsDue,
        quizzesToday,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/history', authenticate, async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await QuizAttempt.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(req.user.id), createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          quizzesTaken: { $sum: 1 },
          questionsAnswered: { $sum: '$total_questions' },
          avgScore: { $avg: '$score' },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json({
      history: history.map((row) => ({
        date: row._id,
        quizzesTaken: row.quizzesTaken,
        questionsAnswered: row.questionsAnswered,
        avgScore: Math.round(row.avgScore * 100) / 100,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
