import React, { useState } from 'react';

function OrderForm({ onOrderPlaced }) {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState(100); // Using amount for UI
  const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/v1/order/place-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEV_TOKEN}` // Essential for Shared Kernel
        },
        body: JSON.stringify({ 
          product, 
          total: Number(amount), // Maps to Postgres "total"
          customer_id: 'user_123' // Maps to Postgres "customer_id"
        }),
      });

      if (!res.ok) throw new Error('Order injection failed');
      
      const data = await res.json();
      onOrderPlaced(data); // Pass { id: 13, ... } to parent
    } catch (err) {
      console.error("Order Error:", err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded border border-slate-700 space-y-3">
      <h3 className="text-emerald-500 font-bold text-sm">PLACE B2B INSTRUCTION</h3>
      <input 
        className="w-full bg-slate-900 p-2 border border-slate-700 text-white text-sm"
        value={product} 
        onChange={e => setProduct(e.target.value)} 
        placeholder="Asset Name (e.g. BTC/NGN)" 
      />
      <input 
        className="w-full bg-slate-900 p-2 border border-slate-700 text-white text-sm"
        type="number" 
        value={amount} 
        onChange={e => setAmount(e.target.value)} 
      />
      <button type="submit" className="w-full bg-emerald-600 py-2 font-bold hover:bg-emerald-500 transition-all">
        EXECUTE ORDER
      </button>
    </form>
  );
}

export default OrderForm;