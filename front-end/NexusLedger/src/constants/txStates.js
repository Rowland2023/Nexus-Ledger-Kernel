export const TX_STATES = {
  IDLE: 'IDLE',
  PROCESSING: 'PROCESSING', // API accepted (202), waiting for Ledger settlement
  SETTLED: 'SETTLED',     // Transaction confirmed in Ledger
  ERROR: 'ERROR'          // Network or validation failure
};