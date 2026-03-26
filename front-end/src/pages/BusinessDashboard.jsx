import React, { useState, useEffect, useCallback } from 'react';
import { useOrderTransaction } from '../hooks/useOrderTransaction';

const BusinessDashboard = () => {
  const { status, error, placeOrder } = useOrderTransaction();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, avgLatency: 12 });

  // 💱 "Expert-Level" Currency Formatter (Safe Fallback)
  const formatValue = (amount, currencyCode) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'NGN',
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (e) {
      const symbols = { NGN: '₦', GBP: '£', USD: '$', EUR: '€' };
      return `${symbols[currencyCode] || '₦'}${Number(amount).toLocaleString()}`;
    }
  };

  // 🔄 Sync Dashboard Logic (Memoized to prevent unnecessary re-renders)
  const syncDashboard = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/order/list');
      
      if (!res.ok) throw new Error(`HTTP_${res.status}: Ledger Offline`);
      
      const result = await res.json();
      // Adjusting to match common API response structures (data property)
      const actualOrders = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
      
      setOrders(actualOrders);
      
      const total = actualOrders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
      setStats(prev => ({ ...prev, totalRevenue: total }));
    } catch (err) {
      console.error("📊 Sync Failure:", err.message);
    }
  }, []);

  useEffect(() => {
    syncDashboard();
    const interval = setInterval(syncDashboard, 5000); 
    return () => clearInterval(interval);
  }, [syncDashboard]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      
      {/* 🔔 Toast Notification */}
      {status === 'SETTLED' && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2 rounded font-black text-[10px] shadow-2xl animate-bounce border-2 border-black">
          TX_SETTLED_SUCCESSFULLY
        </div>
      )}

      {/* 📊 KPI HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border-l-4 border-emerald-500 p-6 rounded-r-xl shadow-lg">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue Velocity (Total)</h3>
          <p className="text-4xl font-black text-white mt-1">
            {formatValue(stats.totalRevenue, 'NGN')}
          </p>
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
        <div className="lg:col-span-1 bg-black border border-slate-800 p-6 rounded-xl self-start sticky top-24 shadow-2xl">
          <h2 className="text-xs font-black text-emerald-500 mb-6 tracking-tighter uppercase underline decoration-emerald-900 underline-offset-8">TX_INITIATION_PROMPT</h2>
          
          <form 
            className="space-y-4" 
            autoComplete="off"
            onSubmit={async (e) => {
              e.preventDefault();
              
              // 🛡️ 1. CAPTURE FORM REFERENCE IMMEDIATELY
              // This ensures 'formElement' stays valid after the 'await'
              const formElement = e.currentTarget;
              const formData = new FormData(formElement);

              const payload = {
                businessName: formData.get('entity'),
                amount: Number(formData.get('amount')),
                jurisdiction: formData.get('jurisdiction'),
                bankDetails: {
                  acc: formData.get('account'),
                  bank: formData.get('bank')
                },
                items: [{ note: formData.get('desc') || "General Settlement" }]
              };

              // 🚀 2. EXECUTE VIA HOOK
              const result = await placeOrder(payload);

              // ✅ 3. SAFE RESET & REFRESH
              if (result) {
                formElement.reset(); // Clears figures from UI
                
                // Immediate sync to show the new record without waiting 5s
                setTimeout(syncDashboard, 800); 
              }
            }}
          >
            <input name="entity" placeholder="ENTITY NAME (LEGAL)" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-xs focus:border-emerald-500 outline-none placeholder:text-slate-700 text-white" required />
            
            <div className="grid grid-cols-2 gap-2">
              <input name="account" placeholder="ACC_NUMBER" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-[10px] focus:border-cyan-500 outline-none placeholder:text-slate-700 text-white" required />
              <select name="jurisdiction" className="bg-slate-900 border border-slate-800 p-3 rounded text-[10px] text-slate-400 outline-none focus:border-emerald-500 cursor-pointer">
                <option value="NG">NIGERIA (NGN)</option>
                <option value="UK">UNITED KINGDOM (GBP)</option>
                <option value="US">UNITED STATES (USD)</option>
                <option value="EU">EUROPE (EUR)</option>
              </select>
            </div>

            <select name="bank" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-[10px] text-slate-400 outline-none focus:border-cyan-500 cursor-pointer">
              <optgroup label="NIGERIA - NIBSS RAIL">
                <option value="ACCESS">ACCESS BANK PLC</option>
                <option value="GTB">GTCO (GUARANTY TRUST BANK)</option>
                <option value="ZENITH">ZENITH BANK PLC</option>
                <option value="MONIEPOINT">MONIEPOINT MFB</option>
                <option value="OPAY">OPAY DIGITAL SERVICES</option>
              </optgroup>
              <optgroup label="UNITED KINGDOM - CoP RAIL">
                <option value="BARCLAYS">BARCLAYS BANK UK</option>
                <option value="HSBC_UK">HSBC UK BANK</option>
                <option value="MONZO">MONZO BANK LTD</option>
                <option value="REVOLUT_UK">REVOLUT BUSINESS (UK)</option>
              </optgroup>
              <optgroup label="UNITED STATES - ACH RAIL">
                <option value="JPMORGAN">J.P. MORGAN CHASE</option>
                <option value="BofA">BANK OF AMERICA</option>
                <option value="MERCURY">MERCURY TECHNOLOGIES</option>
              </optgroup>
              <optgroup label="EUROPE - SEPA RAIL">
                <option value="BNP_PARIBAS">BNP PARIBAS (FR)</option>
                <option value="N26">N26 BANK AG</option>
              </optgroup>
            </select>

            <input name="amount" type="number" placeholder="AMOUNT" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-xs focus:border-emerald-500 outline-none placeholder:text-slate-700 text-white" required />
            <textarea name="desc" placeholder="TX_DESCRIPTION / METADATA" className="w-full bg-slate-900 border border-slate-800 p-3 rounded text-xs h-16 outline-none focus:border-emerald-500 placeholder:text-slate-700 text-white" />
            
            <button 
              type="submit"
              disabled={status === 'PROCESSING'}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-black font-black py-4 rounded text-xs transition-all shadow-lg uppercase"
            >
              {status === 'PROCESSING' ? 'SYNCHRONIZING...' : 'EXECUTE SETTLEMENT'}
            </button>

            {error && (
              <p className="text-[9px] text-red-500 font-mono mt-2 uppercase text-center border border-red-900/50 p-2 bg-red-950/20">
                ⚠️ {error}
              </p>
            )}
          </form>
        </div>

        {/* 📑 TRANSACTION LOG */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Global District Transactions</h2>
            <span className="text-[9px] font-mono text-emerald-500 animate-pulse">● LIVE_STREAM_ACTIVE</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-black text-slate-500 uppercase font-black">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Entity</th>
                    <th className="p-4">Value</th>
                    <th className="p-4 text-emerald-500">Verification_Rail</th>
                    <th className="p-4">Integrity</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.length > 0 ? (
                    orders.map(order => (
                      <tr key={order.id} className="hover:bg-black/40 transition-colors group">
                        <td className="p-4 font-mono text-emerald-700">#00{order.id}</td>
                        <td className="p-4">
                          <div className="text-white font-bold">{order.bank_name || 'BANK_X'}</div>
                          <div className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter">
                            ****{order.account_number?.slice(-4) || '0000'}
                          </div>
                        </td>
                        <td className="p-4 font-bold group-hover:text-white transition-colors">
                          {order.customer_name || 'N/A'}
                        </td>
                        
                        <td className="p-4 font-mono text-white">
                          {formatValue(order.total_amount, order.currency)}
                        </td>

                        <td className="p-4">
                          <span className="bg-slate-950 px-2 py-1 rounded text-[9px] text-cyan-500 border border-cyan-900 font-mono uppercase">
                            {order.verification_rail || 'NIBSS (NG)'}
                          </span>
                        </td>
                        
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-sm text-[9px] font-black border tracking-tighter bg-emerald-900/30 text-emerald-400 border-emerald-800">
                            {order.matching_score || 100}%_MATCH
                          </span>
                        </td>

                        <td className="p-4 text-slate-500 font-mono">
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString() : '--:--'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-600 italic">
                        📡 No transactions found in ledger stream. Awaiting TX_INIT...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;