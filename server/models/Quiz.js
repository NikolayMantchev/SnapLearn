import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  upload_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true, index: true },
  title:      { type: String, required: true },
  subject:    { type: String, default: null },
  difficulty: { type: String, default: 'medium', enum: ['easy', 'medium', 'hard'] },
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
