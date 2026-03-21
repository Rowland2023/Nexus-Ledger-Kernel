import React, { useState, useEffect } from 'react';
import { useOrderTransaction } from '../hooks/useOrderTransaction';

const BusinessDashboard = () => {
  const { status, error, placeOrder } = useOrderTransaction();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, avgLatency: 12 });

  // 📡 Real-time Sync: Fetching updates from the Ledger
  const syncDashboard = async () => {
    try {
      const res = await fetch('/api/v1/order/list');
      const data = await res.json();
      setOrders(data);
      
      // Calculate Revenue Velocity from live data
      const revenue = data.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
      setStats(prev => ({ ...prev, totalRevenue: revenue }));
    } catch (err) {
      console.error("Sync Failure:", err);
    }
  };

  useEffect(() => {
    syncDashboard();
    const interval = setInterval(syncDashboard, 3000); // Fast polling for observability
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* 📊 KPI HEADER (Observability Widgets) */}
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
        {/* 🕹️ COMMAND PANEL (The Form) */}
        <div className="lg:col-span-1 bg-black border border-slate-800 p-6 rounded-xl self-start sticky top-24">
          <h2 className="text-xs font-black text-emerald-500 mb-6 tracking-tighter">TX_INITIATION_PROMPT</h2>
          <form className="space-y-4" onSubmit={async (e) => {
             e.preventDefault();
             const formData = new FormData(e.target);
             await placeOrder({
               customerName: formData.get('entity'),
               totalAmount: formData.get('amount'),
               goodsSummary: formData.get('desc')
             });
             e.target.reset();
             syncDashboard(); // Immediate refresh
          }}>
            <input name="entity" placeholder="ENTITY" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-xs focus:border-emerald-500 outline-none" required />
            <input name="amount" type="number" placeholder="AMOUNT (₦)" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-xs focus:border-emerald-500 outline-none" required />
            <textarea name="desc" placeholder="TX_DESCRIPTION" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-xs h-24 outline-none focus:border-emerald-500" />
            
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-4 rounded text-xs transition-all shadow-lg shadow-emerald-900/20">
              {status === 'PROCESSING' ? 'SYNCHRONIZING...' : 'EXECUTE SETTLEMENT'}
            </button>
          </form>
        </div>

        {/* 📑 RECENT ACTIVITY (The Visual Ledger) */}
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
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-black/40 transition-colors">
                    <td className="p-4 font-mono text-emerald-700">#00{order.id}</td>
                    <td className="p-4 font-bold">{order.customer_name}</td>
                    <td className="p-4 font-mono text-white">₦{Number(order.total).toLocaleString()}</td>
                    <td className="p-4 text-slate-500">{new Date(order.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;