import { Router } from 'express';
import * as OrderController from './controller.js';

const router = Router();

/**
 * 📊 GET /api/v1/order/list
 * This fixes the 404 / SyntaxError in your Feed
 */
router.get('/list', (req, res, next) => {
  console.log('📡 [Minimal Router] Fetching order list...');
  next();
}, OrderController.listOrders); // Ensure this function exists in controller.js!

/**
 * 💸 POST /api/v1/order/place-order
 */
router.post('/place-order', 
  (req, res, next) => {
    res.setTimeout(5000, () => {
      console.error('⚠️ [Minimal Router] Request TIMEOUT at 5000ms');
      if (!res.headersSent) {
        res.status(408).json({ 
          error: 'Request Timeout', 
          detail: 'Auth passed, but logic hung at the Controller/DB level' 
        });
      }
    });
    next();
  },

  (req, res, next) => {
    console.log('🚀 [Minimal Router] Hitting Controller for /place-order...');
    next();
  },

  OrderController.placeOrder 
);

export default router;