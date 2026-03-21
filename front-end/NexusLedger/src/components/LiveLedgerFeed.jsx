import React, { useEffect, useState } from 'react';

const LiveLedgerFeed = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN;

  // ₦ Currency Formatter
  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/v1/order/list', {
        headers: { 'Authorization': `Bearer ${DEV_TOKEN}` }
      });
      const data = await res.json();
      setOrders(data.slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error("Feed Sync Error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 bg-black/60 border border-slate-800 rounded-lg p-6 font-mono shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          <h3 className="text-emerald-500 text-xs font-bold tracking-widest uppercase">📡 Ledger_Stream_v1.0</h3>
        </div>
        <span className="text-[10px] text-slate-500 italic">POLLING_INTERVAL: 5000MS</span>
      </div>

      {loading ? (
        <div className="text-slate-600 text-xs animate-pulse">Establishing handshake with Postgres...</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="flex justify-between items-center text-[12px] group hover:bg-slate-800/40 p-2 rounded transition-all border-l border-slate-800 hover:border-emerald-500"
            >
              <span className="text-slate-500 font-bold w-12">#{order.id}</span>
              <span className="text-slate-100 flex-1 px-4">{formatNaira(order.total)}</span>
              
              {/* Conditional Status Styling */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                order.status === 'settled' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
              }`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveLedgerFeed;