import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkUsageLimit } from '../middleware/usageLimit.js';
import Upload from '../models/Upload.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';
import ReviewItem from '../models/ReviewItem.js';
import { generate } from '../services/quizGenerator.js';

const router = Router();

router.post('/generate', authenticate, checkUsageLimit, async (req, res, next) => {
  try {
    const { uploadId, uploadIds, numQuestions, difficulty, types } = req.body;

    // Support single uploadId or array of uploadIds
    const ids = uploadIds?.length ? uploadIds : uploadId ? [uploadId] : [];
    if (!ids.length) {
      return res.status(400).json({ error: 'uploadId oder uploadIds ist erforderlich' });
    }

    const uploads = await Upload.find({ _id: { $in: ids }, user_id: req.user.id });
    if (!uploads.length) return res.status(404).json({ error: 'Upload(s) nicht gefunden' });

    const textsWithLabels = uploads
      .filter((doc) => doc.extracted_text)
      .map((doc, i) => uploads.length > 1 ? `--- Bild ${i + 1} ---\n${doc.extracted_text}` : doc.extracted_text);

    if (!textsWithLabels.length) {
      return res.status(400).json({ error: 'Kein extrahierter Text vorhanden' });
    }

    const combinedText = textsWithLabels.join('\n\n');
    const primaryUploadId = ids[0];

    const quiz = await generate(req.user.id, primaryUploadId, combinedText, {
      numQuestions, difficulty, types,
    });

    res.status(201).json({ quiz });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    const result = await Promise.all(
      quizzes.map(async (q) => {
        const count = await Question.countDocuments({ quiz_id: q._id });
        return { ...q.toObject(), id: q._id, question_count: count };
      })
    );
    res.json({ quizzes: result });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!quiz) return res.status(404).json({ error: 'Quiz nicht gefunden' });

    const questions = await Question.find({ quiz_id: quiz._id }).sort({ order_index: 1 });
    const attempts = await QuizAttempt.find({ quiz_id: quiz._id, user_id: req.user.id }).sort({ createdAt: -1 });

    res.json({ quiz, questions, attempts });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/submit', authenticate, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!quiz) return res.status(404).json({ error: 'Quiz nicht gefunden' });

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers Array ist erforderlich' });
    }

    const questions = await Question.find({ quiz_id: quiz._id }).sort({ order_index: 1 });
    let correctCount = 0;

    const detailedResults = questions.map((question, idx) => {
      // Match by questionId first, fall back to array index
      const userAnswer = answers.find((a) => a.questionId === question._id.toString())
        ?? answers[idx];
      const givenAnswer = userAnswer ? (userAnswer.answer ?? '') : '';
      let isCorrect = false;

      if (!givenAnswer.trim()) {
        isCorrect = false;
      } else if (question.type === 'multiple_choice') {
        const given = givenAnswer.trim().toLowerCase();
        const correct = question.correct_answer.trim().toLowerCase();
        // Direct match
        isCorrect = given === correct;
        // If correct_answer is a letter (A-D), match by option index
        if (!isCorrect && /^[a-d]$/i.test(question.correct_answer.trim())) {
          const correctIdx = question.correct_answer.trim().toUpperCase().charCodeAt(0) - 65;
          const correctOption = question.options?.[correctIdx];
          if (correctOption) {
            isCorrect = given === correctOption.trim().toLowerCase();
          }
        }
        // If given answer is a letter (A-D), resolve to option text and compare
        if (!isCorrect && /^[a-d]$/i.test(givenAnswer.trim())) {
          const givenIdx = givenAnswer.trim().toUpperCase().charCodeAt(0) - 65;
          const givenOption = question.options?.[givenIdx];
          if (givenOption) {
            isCorrect = givenOption.trim().toLowerCase() === correct;
          }
        }
      } else {
        // Free text: flexible matching
        const given = givenAnswer.trim().toLowerCase();
        const correct = question.correct_answer.trim().toLowerCase();
        isCorrect = given === correct
          || given.includes(correct)
          || (correct.includes(given) && given.length >= Math.min(correct.length * 0.5, 10));
      }


      if (isCorrect) correctCount++;

      return {
        questionId: question._id,
        questionText: question.question_text,
        type: question.type,
        givenAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation,
        options: question.options,
      };
    });

    const totalQuestions = questions.length;
    const score = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100 * 100) / 100
      : 0;

    const attempt = await QuizAttempt.create({
      quiz_id: quiz._id,
      user_id: req.user.id,
      score,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      answers,
    });

    // Create review items for wrong answers
    for (const result of detailedResults) {
      if (!result.isCorrect) {
        await ReviewItem.findOneAndUpdate(
          { user_id: req.user.id, question_id: result.questionId },
          {
            ease_factor: 2.5,
            interval: 0,
            repetitions: 0,
            next_review: new Date(),
            last_review: new Date(),
          },
          { upsert: true, new: true }
        );
      }
    }

    res.json({
      attemptId: attempt._id,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      results: detailedResults,
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!quiz) return res.status(404).json({ error: 'Quiz nicht gefunden' });

    const questionIds = (await Question.find({ quiz_id: quiz._id }).select('_id')).map(q => q._id);
    await ReviewItem.deleteMany({ user_id: req.user.id, question_id: { $in: questionIds } });
    await Question.deleteMany({ quiz_id: quiz._id });
    await QuizAttempt.deleteMany({ quiz_id: quiz._id });
    await Quiz.deleteOne({ _id: quiz._id });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
