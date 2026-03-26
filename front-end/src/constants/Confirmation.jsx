import React from 'react';
import { TX_STATES } from './txStates';

const Confirmation = ({ status, error }) => {
  if (status === TX_STATES.IDLE) return null;

  return (
    <div className="mt-8 p-6 rounded-lg border bg-slate-900/50 backdrop-blur-sm">
      {status === TX_STATES.PROCESSING && (
        <div className="flex items-center gap-3 text-amber-400 font-mono">
          <div className="animate-spin border-2 border-t-transparent border-amber-400 w-4 h-4 rounded-full"></div>
          INGESTING TRANSACTION TO LEDGER...
        </div>
      )}

      {status === TX_STATES.SETTLED && (
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="text-emerald-400 text-4xl mb-2">✅</div>
          <h2 className="text-emerald-400 font-bold text-lg">TRANSACTION SETTLED</h2>
          <p className="text-slate-400 text-xs font-mono uppercase mt-1">Status: ACID CONFIRMED (POSTGRES_SYNC)</p>
        </div>
      )}

      {status === TX_STATES.ERROR && (
        <div className="border border-red-500/50 bg-red-500/10 p-4 rounded text-red-400 text-sm">
          <span className="font-bold">⚠️ HANDSHAKE FAILURE:</span> {error}
        </div>
      )}
    </div>
  );
};

export default Confirmation;