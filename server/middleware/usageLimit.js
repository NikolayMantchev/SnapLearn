import User from '../models/User.js';

/**
 * Middleware that checks whether the authenticated user has remaining uploads
 * for the current month. Resets the counter if a new month has started.
 * Must be placed AFTER the `authenticate` middleware.
 */
export async function checkUsageLimit(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'Benutzer nicht gefunden' });

    user.checkAndResetMonthlyUsage();

    const limit = user.getUploadLimit();
    if (user.uploads_this_month >= limit) {
      return res.status(403).json({
        error: 'Upload-Limit erreicht',
        code: 'USAGE_LIMIT_REACHED',
        plan: user.plan,
        uploads_this_month: user.uploads_this_month,
        upload_limit: limit,
      });
    }

    // Increment usage count
    user.uploads_this_month += 1;
    await user.save();

    // Attach usage info to request for downstream use
    req.usage = {
      plan: user.plan,
      uploads_this_month: user.uploads_this_month,
      upload_limit: limit,
    };

    next();
  } catch (err) {
    next(err);
  }
}
