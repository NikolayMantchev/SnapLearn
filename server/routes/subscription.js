import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import User, { PLANS } from '../models/User.js';

const router = Router();

/**
 * GET /api/subscription — current plan & usage info
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

    user.checkAndResetMonthlyUsage();
    await user.save();

    res.json({
      plan: user.plan,
      plan_label: PLANS[user.plan]?.label,
      uploads_this_month: user.uploads_this_month,
      upload_limit: user.getUploadLimit(),
      uploads_remaining: Math.max(0, user.getUploadLimit() - user.uploads_this_month),
      plans: Object.entries(PLANS).map(([key, val]) => ({
        id: key,
        label: val.label,
        uploads_per_month: val.uploadsPerMonth,
        price: key === 'free' ? '0€' : key === 'basic' ? '2,99€/Monat' : '12,99€/Monat',
      })),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/subscription/upgrade — upgrade plan (payment validation placeholder)
 * Body: { plan: 'basic' | 'pro' }
 *
 * TODO: Integrate RevenueCat or Google Play Billing validation here.
 * For now, this accepts a purchase token placeholder.
 */
router.post('/upgrade', authenticate, async (req, res, next) => {
  try {
    const { plan, purchaseToken } = req.body;

    if (!plan || !PLANS[plan]) {
      return res.status(400).json({ error: 'Ungültiger Plan' });
    }
    if (plan === 'free') {
      return res.status(400).json({ error: 'Downgrade zu Free nicht über diesen Endpoint' });
    }

    // TODO: Validate purchaseToken with Google Play / RevenueCat
    if (!purchaseToken) {
      return res.status(400).json({ error: 'purchaseToken ist erforderlich' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

    user.plan = plan;
    await user.save();

    res.json({
      message: `Plan auf ${PLANS[plan].label} geändert`,
      plan: user.plan,
      upload_limit: user.getUploadLimit(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
