/**
 * Standard Express error-handling middleware.
 * Logs the error and returns an appropriate HTTP status code.
 */
export function errorHandler(err, _req, res, _next) {
  console.error('[error]', err.message || err);

  // Multer file-size / file-filter errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Datei zu groß (max. 10 MB)' });
  }

  if (err.message && err.message.includes('Nur Bilder erlaubt')) {
    return res.status(400).json({ error: err.message });
  }

  // Validation / bad-request errors
  if (err.status === 400 || err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: err.message || 'Ungültige Anfrage' });
  }

  // Authentication errors
  if (err.status === 401) {
    return res.status(401).json({ error: err.message || 'Nicht autorisiert' });
  }

  // Not found
  if (err.status === 404) {
    return res.status(404).json({ error: err.message || 'Nicht gefunden' });
  }

  // Everything else is a 500
  return res.status(500).json({ error: 'Interner Serverfehler' });
}
