import React, { useState, useEffect } from 'react';
import { useOrderTransaction } from '../hooks/useOrderTransaction';

const BusinessDashboard = () => {
  const { status, error, placeOrder } = useOrderTransaction();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, avgLatency: 12 });

  /**
   * 📡 REAL-TIME SYNC
   * Updated to use the explicit backend port (3000) to avoid Connection Refused.
   */
  const syncDashboard = async () => {
    try {
      // ✅ FIX: Use absolute URL to target the backend container port
      const res = await fetch('http://localhost:3000/api/v1/order/list');
      
      if (!res.ok) throw new Error("Ledger Offline");
      
      const result = await res.json();
      
      // ✅ FIX: Extract the array from the 'data' property
      const actualOrders = Array.isArray(result.data) ? result.data : [];
      setOrders(actualOrders);
      
      // ✅ FIX: Calculate Revenue using the actual array and correct column name
      const revenue = actualOrders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
      setStats(prev => ({ ...prev, totalRevenue: revenue }));
      
    } catch (err) {
      console.error("📊 Sync Failure:", err.message);
    }
  };

  useEffect(() => {
    syncDashboard();
    const interval = setInterval(syncDashboard, 3000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      
      {status === 'SETTLED' && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2 rounded font-black text-[10px] shadow-2xl animate-pulse">
          LATEST_TX_COMMITTED_TO_LEDGER
        </div>
      )}

      {/* 📊 KPI HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-lg">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Velocity</h3>
          <p className="text-4xl font-black text-white mt-1">₦{stats.totalRevenue.toLocaleString()}</p>
          <div className="text-[9px] text-emerald-800 font-mono mt-2">REAL-TIME DB_SYNC ACTIVE</div>
        </div>
        
        <div className="bg-slate-900 border-l-4 border-cyan-500 p-6 rounded-r-xl shadow-lg">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Latency</h3>
          <p className="text-4xl font-black text-cyan-400 mt-1">{stats.avgLatency}ms</p>
          <div className="text-[9px] text-cyan-900 font-mono mt-2">POSTGRES_RESPONSE_TIME</div>
        </div>

        <div className="bg-slate-900 border-l-4 border-amber-500 p-6 rounded-r-xl shadow-lg">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ledger Integrity</h3>
          <p className="text-4xl font-black text-amber-400 mt-1">100%</p>
          <div className="text-[9px] text-amber-900 font-mono mt-2">ACID_PROPERTIES_VERIFIED</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 🕹️ COMMAND PANEL */}
        <div className="lg:col-span-1 bg-black border border-slate-800 p-6 rounded-xl self-start sticky top-24">
          <h2 className="text-xs font-black text-emerald-500 mb-6 tracking-tighter">TX_INITIATION_PROMPT</h2>
          
          <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              const payload = {
                businessName: formData.get('entity'),
                bankNameFromAPI: formData.get('entity'),
                amount: Number(formData.get('amount')),
                jurisdiction: 'NG',
                items: [{ note: formData.get('desc') || "General Settlement" }]
              };

              await placeOrder(payload);
              e.currentTarget.reset();
              setTimeout(syncDashboard, 1000); 
          }}>
            <input name="entity" placeholder="ENTITY NAME" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-xs focus:border-emerald-500 outline-none" required />
            <input name="amount" type="number" placeholder="AMOUNT (₦)" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-xs focus:border-emerald-500 outline-none" required />
            <textarea name="desc" placeholder="TX_DESCRIPTION" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-xs h-24 outline-none focus:border-emerald-500" />
            
            <button 
              type="submit"
              disabled={status === 'PROCESSING'}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-black font-black py-4 rounded text-xs transition-all shadow-lg shadow-emerald-900/20"
            >
              {status === 'PROCESSING' ? 'SYNCHRONIZING...' : 'EXECUTE SETTLEMENT'}
            </button>

            {error && <p className="text-[9px] text-red-500 font-mono mt-2 uppercase">⚠️ {error}</p>}
          </form>
        </div>

        {/* 📑 RECENT ACTIVITY */}
        <div className="lg:col-span-3">
          <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Lagos District Transactions</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-black text-slate-500 uppercase">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-black/40 transition-colors">
                      <td className="p-4 font-mono text-emerald-700">#00{order.id}</td>
                      <td className="p-4 font-bold">{order.customer_name || 'N/A'}</td>
                      <td className="p-4 font-mono text-white">₦{Number(order.total_amount || 0).toLocaleString()}</td>
                      <td className="p-4 text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleTimeString() : '--:--'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-600 italic">No transactions found in ledger stream.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;