import React from 'react';
import { TX_STATES } from '../constants/txStates';

const Confirmation = ({ status, error }) => {
  if (status === TX_STATES.IDLE) return null;

  return (
    <div className="mt-4 p-4 rounded-lg border font-mono text-sm transition-all duration-300">
      {status === TX_STATES.PROCESSING && (
        <div className="text-amber-400 flex items-center gap-2">
          <span className="animate-spin">⚙️</span>
          <span>TRANSACTION_PENDING: Writing to Lagos Node...</span>
        </div>
      )}

      {status === TX_STATES.SUCCESS && (
        <div className="text-emerald-400 border-emerald-900/50 bg-emerald-950/20 p-3 rounded">
          <p className="font-bold">✅ TRANSACTION SETTLED</p>
          <p className="text-[10px] opacity-70 mt-1">Status: ACID CONFIRMED (POSTGRES_SYNC)</p>
        </div>
      )}

      {status === TX_STATES.ERROR && (
        <div className="text-rose-400 border-rose-900/50 bg-rose-950/20 p-3 rounded">
          <p className="font-bold">❌ LEDGER_REJECTION</p>
          <p className="text-[10px] mt-1">{error || 'Unknown Sync Failure'}</p>
        </div>
      )}
    </div>
  );
};

export default Confirmation;