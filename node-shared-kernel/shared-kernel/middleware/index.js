/**
 * Shared Kernel - Middleware Barrel File
 */

// 1. Auth Middleware (Named export from security-core)
export { authMiddleware } from '../security-core/authMiddleware.js';

// 2. Validation Middleware (Usually a named export)
export { validate } from './validator.js';

// 3. Rate Limiter (If this fails, try: export { rateLimiter } from './rateLimiter.js')
export { default as rateLimiter } from './rateLimiter.js';

// 4. Idempotency Middleware
// FIXED: Using named export because idempotency.js does not have a 'default'
export { idempotencyMiddleware } from './idempotency.js';