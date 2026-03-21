import { infrastructure } from '@yourorg/shared-kernel';

const { primaryPool } = infrastructure;

export const ledgerModel = {
  /**
   * createTransfer - Atomic Ledger + Outbox Write
   */
  createTransfer: async ({ account_id, amount, type, reference, currency = 'NGN' }) => {
    console.log(`⏳ [Model] Atomic write for Account: ${account_id}`);

    const query = {
      text: `
        WITH ledger_entry AS (
          INSERT INTO ledger (account_id, amount, type, reference, currency) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING id, account_id, amount, currency
        )
        INSERT INTO outbox (event_type, aggregate_type, aggregate_id, payload, status)
        SELECT 'FUNDS_TRANSFERRED', 'Ledger', id::text, 
               jsonb_build_object(
                 'ledgerId', id, 
                 'accountId', account_id, 
                 'amount', amount, 
                 'currency', currency
               ), 
               'PENDING'
        FROM ledger_entry
        RETURNING id as outbox_id, aggregate_id as ledger_id;
      `,
      values: [account_id, amount, type, reference, currency]
    };

    const result = await primaryPool.query(query);
    if (!result.rows[0]) throw new Error('DATABASE_WRITE_FAILED');
    
    return result.rows[0]; // Returns { outbox_id, ledger_id }
  }
};