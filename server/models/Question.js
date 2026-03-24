import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quiz_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
  type:           { type: String, required: true, enum: ['multiple_choice', 'free_text'] },
  question_text:  { type: String, required: true },
  options:        { type: [String], default: null },
  correct_answer: { type: String, required: true },
  explanation:    { type: String, default: null },
  order_index:    { type: Number, required: true },
});

export default mongoose.model('Question', questionSchema);
