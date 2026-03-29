import mongoose from 'mongoose';

const PLANS = {
  free:  { label: 'Gratis',  uploadsPerMonth: 6 },
  basic: { label: 'Basic',   uploadsPerMonth: 80 },
  pro:   { label: 'Pro',     uploadsPerMonth: 500 },
};

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  plan: { type: String, enum: Object.keys(PLANS), default: 'free' },
  uploads_this_month: { type: Number, default: 0 },
  usage_reset_date: { type: Date, default: () => new Date() },
}, { timestamps: true });

/**
 * Reset monthly usage if we're in a new month.
 */
userSchema.methods.checkAndResetMonthlyUsage = function () {
  const now = new Date();
  const resetDate = this.usage_reset_date || new Date(0);
  if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    this.uploads_this_month = 0;
    this.usage_reset_date = now;
  }
};

userSchema.methods.getUploadLimit = function () {
  return PLANS[this.plan]?.uploadsPerMonth ?? PLANS.free.uploadsPerMonth;
};

userSchema.methods.toSafe = function () {
  this.checkAndResetMonthlyUsage();
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    plan: this.plan,
    uploads_this_month: this.uploads_this_month,
    upload_limit: this.getUploadLimit(),
    created_at: this.createdAt,
  };
};

export { PLANS };

export default mongoose.model('User', userSchema);
