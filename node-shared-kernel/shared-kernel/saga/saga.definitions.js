// /shared/services/sagaDefinitions.js
export const sagaDefinitions = {
  orderSaga: {
    steps: [
      { name: 'reserveInventory', compensation: 'releaseInventory' },
      { name: 'chargePayment', compensation: 'refundPayment' },
      { name: 'createLedgerEntry', compensation: 'rollbackLedgerEntry' },
    ],
  },
};
