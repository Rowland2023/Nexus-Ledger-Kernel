export function idempotencyMiddleware(req, res, next) {
  const key = req.headers['x-idempotency-key'];
  if (!key) {
    return res.status(400).json({ error: 'Missing x-idempotency-key header' });
  }
  console.log(`🔑 Idempotency key: ${key}`);
  next();
}
