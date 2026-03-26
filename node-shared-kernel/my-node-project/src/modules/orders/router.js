import { Router } from 'express';
import * as OrderController from './controller.js';

const router = Router();

/**
 * 📊 GET /api/v1/order/list
 * Fetches the recent ledger entries
 */
router.get('/list', (req, res, next) => {
  console.log('📡 [Orders] Fetching ledger list...');
  next();
}, OrderController.listOrders);

/**
 * 💸 POST /api/v1/order/place-order
 * Includes a 5s timeout safety net for high-integrity writes
 */
router.post('/place-order', 
  (req, res, next) => {
    res.setTimeout(5000, () => {
      console.error('⚠️ [Orders] Request TIMEOUT at 5000ms');
      if (!res.headersSent) {
        res.status(408).json({ 
          error: 'Request Timeout', 
          detail: 'Logic hung at the Controller/DB level' 
        });
      }
    });
    next();
  },
  OrderController.placeOrder 
);

export default router;