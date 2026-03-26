import { useState } from 'react';
import { TX_STATES } from '../constants/txStates';

export const useOrderTransaction = () => {
  const [status, setStatus] = useState(TX_STATES.IDLE);
  const [error, setError] = useState(null);

  const placeOrder = async (payload) => {
    setStatus(TX_STATES.PROCESSING);
    setError(null);

    // 🛡️ INTERNAL LOGIC: Auto-assign Currency and Rail based on Jurisdiction
    const jurisdictionMaps = {
      NG: { currency: 'NGN', rail: 'NIBSS (NG)' },
      UK: { currency: 'GBP', rail: 'CoP (UK)' },
      US: { currency: 'USD', rail: 'Plaid (US)' },
      EU: { currency: 'EUR', rail: 'PSD2 (EU)' },
    };

    const meta = jurisdictionMaps[payload.jurisdiction] || jurisdictionMaps.NG;

    // 🚀 ENRICHED PAYLOAD (Idempotency is key for 50k TPS)
    const enrichedPayload = {
      ...payload,
      currency: meta.currency,
      verification_rail: meta.rail,
      matching_score: 100, 
      // 🛡️ Fallback for crypto.randomUUID if not in a secure context (HTTPS/Localhost)
      idempotencyKey: window.crypto?.randomUUID ? crypto.randomUUID() : `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`, 
      timestamp: new Date().toISOString(),
    };

    try {
      // ✅ ALIGNED PATH: Matches router.post('/place-order') in backend
      const response = await fetch('http://localhost:3000/api/v1/order/place-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify(enrichedPayload),
      });

      // 🛡️ GRACEFUL ERROR HANDLING
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        
        // Check if we actually got JSON back
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          throw new Error(errData.message || `LEDGER_REJECTION: ${response.status}`);
        } else {
          // 🛡️ Prevents the "Unexpected token <" crash by identifying HTML 404/500 pages
          const errorType = response.status === 404 ? "ROUTE_NOT_FOUND" : "SERVER_CRASH";
          throw new Error(`${errorType}: ${response.status} (Endpoint: /place-order)`);
        }
      }

      const result = await response.json();

      // ✅ SETTLEMENT PHASE
      setStatus(TX_STATES.SETTLED);
      
      // Auto-reset UI state after 3 seconds
      setTimeout(() => setStatus(TX_STATES.IDLE), 3000);
      
      return result;

    } catch (err) {
      console.error("❌ Ledger Sync Failure:", err.message);
      setError(err.message);
      setStatus(TX_STATES.ERROR);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setError(null);
        setStatus(TX_STATES.IDLE);
      }, 5000);

      return null; 
    }
  };

  return { status, error, placeOrder };
};