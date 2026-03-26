import { useState } from 'react';
import { TX_STATES } from '../constants/txStates';

export const useOrderTransaction = () => {
  const [status, setStatus] = useState(TX_STATES.IDLE);
  const [error, setError] = useState(null);

  const placeOrder = async (orderData) => {
    setStatus(TX_STATES.PROCESSING);
    setError(null);

    try {
      const response = await fetch('/api/v1/order/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          idempotencyKey: crypto.randomUUID() 
        }),
      });

      // ✅ FIX: response.ok covers 201 (Created) and 202 (Accepted)
      if (response.ok) {
        const result = await response.json();
        // Use the ID returned from Postgres for settlement polling
        pollSettlementStatus(result.orderId || result.data?.id);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Order submission failed');
      }
    } catch (err) {
      console.error("Lagos Ledger Sync Error:", err.message);
      setError(err.message);
      setStatus(TX_STATES.ERROR);
    }
  };

  const pollSettlementStatus = (id) => {
    // Simulates the ledger finality delay (settlement window)
    setTimeout(() => setStatus(TX_STATES.SETTLED), 2000);
  };

  return { status, error, placeOrder };
};