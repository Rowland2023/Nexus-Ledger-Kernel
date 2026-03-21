import React, { useState } from 'react';

function PaymentForm({ order }) {
  const [from, setFrom] = useState('ACC-SOURCE-01');
  const [to, setTo] = useState('merchant_account');
  const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN;

  const handlePayment = async () => {
    try {
      const res = await fetch('/api/v1/ledger/transfer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEV_TOKEN}` 
        },
        body: JSON.stringify({ 
          amount: order.total, 
          from_account: from, // Standardizing naming
          to_account: to,
          reference_order_id: order.id 
        }),
      });

      const data = await res.json();
      console.log('⚡ Ledger Settlement Initiated:', data);
    } catch (err) {
      console.error("Payment Handshake Failed:", err.message);
    }
  };

  return (
    <div className="mt-4 p-4 bg-slate-900 border-l-4 border-emerald-500 rounded">
      <h3 className="text-white font-mono text-sm mb-2">Authorize Payment for Order #{order.id}</h3>
      <div className="flex gap-2">
        <input 
          className="bg-slate-800 border border-slate-700 p-2 text-xs text-white flex-1"
          value={from} 
          onChange={e => setFrom(e.target.value)} 
          placeholder="Source Account" 
        />
        <button 
          onClick={handlePayment}
          className="bg-blue-600 px-4 py-2 text-xs font-bold hover:bg-blue-500 transition-colors"
        >
          SETTLE {order.total} NGN
        </button>
      </div>
    </div>
  );
}

export default PaymentForm;