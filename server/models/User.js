import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
}, { timestamps: true });

userSchema.methods.toSafe = function () {
  return { id: this._id, username: this.username, email: this.email, created_at: this.createdAt };
};

export default mongoose.model('User', userSchema);
