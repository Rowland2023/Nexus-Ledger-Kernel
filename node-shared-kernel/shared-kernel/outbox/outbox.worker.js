import { primaryPool } from '../infrastructure/postgres.js';
import { kafka } from '../infrastructure/kafka.js';

export const processOutbox = async () => {
  const client = await primaryPool.connect();
  try {
    // 1. Atomic Fetch: Move PENDING rows to PROCESSING
    // Uses SKIP LOCKED to prevent multiple workers from fighting over the same rows
    const result = await client.query(`
      UPDATE outbox
      SET status = 'PROCESSING', updated_at = NOW()
      WHERE id IN (
        SELECT id FROM outbox
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT 50
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *;
    `);

    if (result.rowCount === 0) return 0;

    const producer = kafka.producer();
    await producer.connect();

    // 2. Map DB rows to Kafka messages
    const messages = result.rows.map(row => ({
      key: String(row.aggregate_id),
      value: JSON.stringify(row.payload),
    }));

    // 3. Publish to Kafka
    await producer.send({
      topic: 'bank-transfers',
      messages,
    });

    // 4. Mark as COMPLETED
    const ids = result.rows.map(r => r.id);
    await client.query(
      'UPDATE outbox SET status = $1 WHERE id = ANY($2)',
      ['COMPLETED', ids]
    );

    await producer.disconnect();
    return result.rowCount;
  } catch (error) {
    console.error('❌ Outbox Worker Error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// THE FIXED STARTER
export const startOutboxWorker = (intervalMs = 5000) => {
  console.log(`⚡ Outbox Worker initialized. Polling every ${intervalMs}ms...`);
  
  setInterval(async () => {
    try {
      const count = await processOutbox();
      if (count > 0) {
        console.log(`✅ Dispatched ${count} messages to Kafka.`);
      }
    } catch (err) {
      // We catch here so the setInterval loop doesn't die on a single error
      console.error('⚠️ Loop iteration failed, retrying in next cycle...');
    }
  }, intervalMs);
};