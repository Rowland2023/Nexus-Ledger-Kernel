// /shared-kernel/middleware/loggingMiddleware.js
export default function loggingMiddleware(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}
