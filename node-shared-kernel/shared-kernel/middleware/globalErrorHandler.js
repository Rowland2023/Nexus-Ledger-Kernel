// /shared/middleware/globalErrorHandler.js
export function globalErrorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
}
