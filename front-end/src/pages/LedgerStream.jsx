import React, { useEffect, useState } from 'react';

const LedgerStream = () => {
  const [logs, setLogs] = useState([]);

  const fetchLedger = async () => {
    try {
      const res = await fetch('/api/v1/order/list');
      if (!res.ok) throw new Error("Offline");
      
      const result = await res.json();
      
      // ✅ FIX: Extract array from data property safely
      setLogs(Array.isArray(result.data) ? result.data : []);
      
    } catch (err) {
      console.error("Ledger Stream Offline", err);
    }
  };

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 3000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-emerald-500 font-mono p-6">
      <header className="mb-6 border-b border-emerald-900 pb-4 flex justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest">📡 NEXUS_LEDGER_STREAM_V1.0</h1>
          <p className="text-xs text-emerald-700">NODE: LAGOS_CENTRAL // STATUS: ACTIVE</p>
        </div>
        <div className="animate-pulse text-xs">● LIVE_FEED</div>
      </header>

      <div className="space-y-2 text-xs">
        {logs.map((log) => (
          <div key={log.id} className="grid grid-cols-4 gap-4 border-b border-emerald-900/30 py-1 hover:bg-emerald-900/10">
            <span className="text-emerald-800">[{new Date(log.created_at).toISOString()}]</span>
            <span className="text-emerald-400 font-bold">TX_{log.id.toString().padStart(5, '0')}</span>
            <span className="truncate">{log.customer_name || 'ANONYMOUS'}</span>
            {/* ✅ FIX: Use total_amount as seen in your DB output */}
            <span className="text-right">₦{Number(log.total_amount || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
      
      {logs.length === 0 && (
        <div className="text-emerald-900 text-center mt-20 italic">No incoming transactions detected...</div>
      )}
    </div>
  );
};

export default LedgerStream;