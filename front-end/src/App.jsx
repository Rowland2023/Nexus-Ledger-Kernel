import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import BusinessDashboard from './pages/BusinessDashboard';
import LedgerStream from './pages/LedgerStream';

const NavLink = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all border ${
        isActive 
          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
      {label}
    </Link>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        
        {/* 🛰️ REDESIGNED HEADER: CLEAR SEPARATION */}
        <nav className="bg-black border-b border-slate-900 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-12">
            {/* Branding */}
            <div className="flex flex-col">
              <span className="text-white font-black tracking-tighter text-xl leading-none">
                NEXUS<span className="text-emerald-500">_</span>LEDGER
              </span>
              <span className="text-[10px] text-slate-600 font-mono mt-1">LAGOS_NODE // v1.0.4</span>
            </div>

            {/* 🔗 SEPARATED NAVIGATION */}
            <div className="flex items-center gap-4 bg-slate-950 p-1 rounded-lg border border-slate-900">
              <NavLink to="/business" label="BUSINESS_OPS" />
              <div className="w-px h-4 bg-slate-800 mx-1"></div> {/* Vertical Divider */}
              <NavLink to="/ledger" label="SYSTEM_LEDGER" />
            </div>
          </div>

          <div className="hidden md:block">
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-500/5 px-3 py-1 rounded border border-emerald-500/20">
              ● SYSTEM_STATUS: OPERATIONAL
            </span>
          </div>
        </nav>

        {/* 🛣️ MAIN CONTENT AREA */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<BusinessDashboard />} />
            <Route path="/business" element={<BusinessDashboard />} />
            <Route path="/ledger" element={<LedgerStream />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;