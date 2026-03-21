import React, { useState } from 'react';
// src/components/CheckoutForm.jsx
export const CheckoutForm = ({ onAction, disabled }) => {
  const [amount, setAmount] = useState(5000); // UI still calls it amount

  const handleSubmit = () => {
    onAction({ 
      total: Number(amount), // Database wants "total"
      account_id: 'ACC-LAGOS-01',
      customer_id: 'CUST-999' 
    });
  };

  return (
    <div className="space-y-4">
      {/* ... your input remains the same ... */}
      <button onClick={handleSubmit} disabled={disabled} className="...">
        Place B2B Order
      </button>
    </div>
  );
};