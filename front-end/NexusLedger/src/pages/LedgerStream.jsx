import React, { useEffect, useState } from 'react';

const LedgerStream = () => {
  const [logs, setLogs] = useState([]);

  const fetchLedger = async () => {
    try {
      const res = await fetch('/api/v1/order/list');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Ledger Stream Offline", err);
    }
  };

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 3000); // Higher frequency for system logs
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
            <span className="truncate">{log.customer_name}</span>
            <span className="text-right">₦{log.total}</span>
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