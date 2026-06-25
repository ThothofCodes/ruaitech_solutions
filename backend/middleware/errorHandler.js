// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Log full error server-side always
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);

  // ── Mongoose: buffering timeout = DB not connected ──────────────────────
  if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
    return res.status(503).json({ message: 'Service temporarily unavailable. Please try again shortly.' });
  }

  // ── Mongoose: validation error ───────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // ── Mongoose: duplicate key ──────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `${field} already exists` });
  }

  // ── Mongoose: bad ObjectId ───────────────────────────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // ── JWT errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Session expired' });

  // ── Multer: file too large ───────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }

  // ── CORS error ───────────────────────────────────────────────────────────
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ message: 'CORS policy violation' });
  }

  // ── Generic — NEVER expose stack trace in production ────────────────────
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    message: isDev ? err.message : 'An error occurred. Please try again.',
    ...(isDev && { stack: err.stack }), // stack only in development
  });
};

module.exports = errorHandler;
