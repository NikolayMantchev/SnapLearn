import jwt from 'jsonwebtoken';

/**
 * Express middleware that verifies a JWT Bearer token.
 * On success, sets req.user = { id, username }.
 * Returns 401 on missing/invalid/expired tokens.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentifizierung erforderlich' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token abgelaufen, bitte erneut anmelden' });
    }
    return res.status(401).json({ error: 'Ungültiges Token' });
  }
}
