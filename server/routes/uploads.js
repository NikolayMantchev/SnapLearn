import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import { checkUsageLimit } from '../middleware/usageLimit.js';
import upload from '../middleware/upload.js';
import Upload from '../models/Upload.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import { extractTextFromImage } from '../services/claudeService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

router.post('/', authenticate, checkUsageLimit, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Kein Bild hochgeladen' });
    }

    const { filename, originalname, mimetype, size, path: filePath } = req.file;

    let extractedText = null;
    let extractionError = null;
    try {
      extractedText = await extractTextFromImage(filePath);
    } catch (err) {
      extractionError = err.message;
      console.error('[uploads] Text extraction failed:', err.message);
    }

    const doc = await Upload.create({
      user_id: req.user.id,
      filename,
      original_name: originalname,
      mime_type: mimetype,
      file_size: size,
      extracted_text: extractedText,
    });

    res.status(201).json({
      upload: {
        id: doc._id,
        filename: doc.filename,
        original_name: doc.original_name,
        mime_type: doc.mime_type,
        file_size: doc.file_size,
        extracted_text: doc.extracted_text,
        extraction_error: extractionError,
        created_at: doc.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const uploads = await Upload.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.json({ uploads });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const uploadDoc = await Upload.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!uploadDoc) return res.status(404).json({ error: 'Upload nicht gefunden' });

    const quizzes = await Quiz.find({ upload_id: uploadDoc._id, user_id: req.user.id });
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (q) => {
        const count = await Question.countDocuments({ quiz_id: q._id });
        return { id: q._id, title: q.title, question_count: count };
      })
    );

    res.json({ upload: uploadDoc, quizzes: quizzesWithCount });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const uploadDoc = await Upload.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!uploadDoc) return res.status(404).json({ error: 'Upload nicht gefunden' });

    await Upload.deleteOne({ _id: uploadDoc._id });

    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadDir, uploadDoc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: 'Upload gelöscht' });
  } catch (err) {
    next(err);
  }
});

export default router;
