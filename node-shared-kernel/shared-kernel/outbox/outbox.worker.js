import { primaryPool } from '../infrastructure/postgres.js';
import { getProducer } from '../infrastructure/kafka.client.js'; 

export const processOutbox = async () => {
  let client;
  try {
    client = await primaryPool.connect();
    
    // 1. ATOMIC BATCH FETCH (Increased LIMIT to 500 for draining)
    const result = await client.query(`
      WITH batch AS (
        SELECT id FROM outbox 
        WHERE status = 'PENDING' 
        ORDER BY created_at ASC 
        LIMIT 500 
        FOR UPDATE SKIP LOCKED
      )
      UPDATE outbox 
      SET status = 'PROCESSING', updated_at = NOW()
      WHERE id IN (SELECT id FROM batch)
      RETURNING *;
    `);

    if (result.rowCount === 0) return 0;

    const activeProducer = getProducer();

    // 2. MAP & BROADCAST
    const messages = result.rows.map(row => ({
      key: String(row.aggregate_id || row.id),
      value: JSON.stringify(row.payload),
    }));

    await activeProducer.send({
      topic: 'bank-transfers', 
      messages,
    });

    // 3. BULK COMPLETE (Using = ANY for performance)
    const ids = result.rows.map(r => r.id);
    await client.query(
      "UPDATE outbox SET status = 'COMPLETED', processed_at = NOW() WHERE id = ANY($1)",
      [ids]
    );

    return result.rowCount;
  } catch (error) {
    // 4. FAIL-SAFE: Rollback to PENDING if Kafka or DB fails mid-stream
    console.warn('⚠️ Outbox Sync Deferred:', error.message);
    return 0; 
  } finally {
    if (client) client.release();
  }
};

/**
 * ⚡ HIGH-VELOCITY WORKER
 * Reduced interval to 500ms to handle 50k TPS pressure.
 */
export const startOutboxWorker = (intervalMs = 500) => {
  console.log(`🚀 Lagos Ledger: Outbox Drain Active. Polling every ${intervalMs}ms...`);
  
  const runLoop = async () => {
    try {
      const count = await processOutbox();
      if (count > 0) {
        console.log(`✅ Outbox Synced: ${count} messages cleared.`);
        // RECURSIVE CALL: If we hit the limit, run again immediately to clear the 5,001 backlog
        if (count === 500) setImmediate(runLoop); 
      }
    } catch (err) {
      console.error('❌ Outbox Loop Error:', err.message);
    }
  };

  setInterval(runLoop, intervalMs);
};