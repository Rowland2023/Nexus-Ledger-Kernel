// /shared/middleware/traceRequest.js
import { v4 as uuidv4 } from 'uuid';

export function traceRequest(req, res, next) {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}
