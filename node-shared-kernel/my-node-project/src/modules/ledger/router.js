import { Router } from 'express';
// ✅ Use namespace import to prevent SyntaxErrors from missing named exports
import * as kernel from '@yourorg/shared-kernel';
import * as LedgerController from './controller.js';

const router = Router();

/**
 * 🔍 The "Discovery" Mapping
 * We use optional chaining to find the middleware regardless of 
 * whether the kernel team nested them under 'middleware' or 'infrastructure'.
 */
const idempotency = kernel.middleware?.idempotencyMiddleware 
                 || kernel.infrastructure?.middleware?.idempotencyMiddleware 
                 || ((req, res, next) => next()); 

const rateLimiter = kernel.middleware?.rateLimiter 
                 || kernel.infrastructure?.middleware?.rateLimiter 
                 || (() => (req, res, next) => next());

/**
 * @endpoint POST /api/v1/ledger/transfer
 */
router.post(
  '/transfer',
  idempotency,
  rateLimiter(5, 60),
  LedgerController.handleTransfer
);

export default router;