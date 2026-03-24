import mongoose from 'mongoose';

const reviewItemSchema = new mongoose.Schema({
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  ease_factor: { type: Number, default: 2.5 },
  interval:    { type: Number, default: 0 },
  repetitions: { type: Number, default: 0 },
  next_review: { type: Date, default: Date.now },
  last_review: { type: Date, default: null },
});

reviewItemSchema.index({ user_id: 1, question_id: 1 }, { unique: true });
reviewItemSchema.index({ user_id: 1, next_review: 1 });

export default mongoose.model('ReviewItem', reviewItemSchema);
