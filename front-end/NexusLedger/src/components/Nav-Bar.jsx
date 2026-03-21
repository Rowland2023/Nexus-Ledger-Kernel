import React from 'react';

const NavBar = () => {
  return (
    <nav className="bg-slate-900 text-white p-4 border-b border-emerald-500/30 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
        <h1 className="text-xl font-bold tracking-tight">LAGOS LEDGER <span className="text-emerald-500 text-sm">TERMINAL</span></h1>
      </div>
      
      <div className="flex gap-6 text-sm font-mono text-slate-400">
        <div>NODE_STATUS: <span className="text-emerald-400">ACTIVE</span></div>
        <div>CAPACITY: <span className="text-white">50,000 TPS</span></div>
      </div>
    </nav>
  );
};

export default NavBar;