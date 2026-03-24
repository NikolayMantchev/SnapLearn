import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import ReviewItem from '../models/ReviewItem.js';
import { calculateNextReview } from '../services/spacedRepetition.js';

const router = Router();

router.get('/due', authenticate, async (req, res, next) => {
  try {
    const items = await ReviewItem.find({
      user_id: req.user.id,
      next_review: { $lte: new Date() },
    })
      .sort({ next_review: 1 })
      .populate('question_id');

    const reviews = items.map((item) => ({
      id: item._id,
      question_id: item.question_id?._id,
      question_text: item.question_id?.question_text,
      type: item.question_id?.type,
      options: item.question_id?.options || null,
      correct_answer: item.question_id?.correct_answer,
      explanation: item.question_id?.explanation || null,
      ease_factor: item.ease_factor,
      interval: item.interval,
      repetitions: item.repetitions,
      next_review: item.next_review,
    }));

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

router.post('/:id', authenticate, async (req, res, next) => {
  try {
    const { quality } = req.body;
    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'quality muss zwischen 0 und 5 liegen' });
    }

    const item = await ReviewItem.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!item) return res.status(404).json({ error: 'Review-Item nicht gefunden' });

    const result = calculateNextReview(quality, item.ease_factor, item.interval, item.repetitions);

    item.ease_factor = result.easeFactor;
    item.interval = result.interval;
    item.repetitions = result.repetitions;
    item.next_review = result.nextReview;
    item.last_review = new Date();
    await item.save();

    res.json({
      id: item._id,
      questionId: item.question_id,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReview: result.nextReview,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
