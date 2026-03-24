import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  user_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  filename:       { type: String, required: true },
  original_name:  { type: String, required: true },
  mime_type:      { type: String, required: true },
  file_size:      { type: Number, required: true },
  extracted_text: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Upload', uploadSchema);
