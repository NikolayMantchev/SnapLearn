import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  quiz_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
  user_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  score:           { type: Number, required: true },
  total_questions: { type: Number, required: true },
  correct_answers: { type: Number, required: true },
  answers:         { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.model('QuizAttempt', quizAttemptSchema);
