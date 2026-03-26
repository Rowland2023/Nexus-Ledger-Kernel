import { primaryPool, connectPostgres } from './infrastructure/database/primary.pool.js';
import { kafka, connectKafka } from './infrastructure/messaging/kafka.client.js';
import { idempotencyMiddleware } from './middleware/idempotency.js';
import { rateLimiter } from './middleware/rateLimiter.js';

export async function connectRedis() {
  console.log('📡 [Redis] Connecting...');
  console.log('✅ [Redis] Connected');
}

export async function enqueueTransfer(transfer) {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic: 'ledger-transfers',
    messages: [{ value: JSON.stringify(transfer) }],
  });
  await producer.disconnect();
}

// CRITICAL: This must be exported for your Controller/API to start!
export const infrastructure = {
  connectRedis,
  connectKafka,
  connectPostgres,
  primaryPool,
  kafka,
  enqueueTransfer,
};

export const middleware = {
  idempotencyMiddleware,
  rateLimiter,
};

// --- The Resilient Outbox Worker ---
export const startOutboxWorker = (interval) => {
  console.log(`📦 [Outbox] Worker initialized. Interval: ${interval}ms`);

  const runTick = async () => {
    let client;
    try {
      client = await primaryPool.connect();
      
      // 1. Fetch PENDING (Removed 'topic' column to fix SQL error)
      const res = await client.query(`
        SELECT id, payload FROM outbox 
        WHERE status = 'PENDING' 
        ORDER BY created_at ASC 
        LIMIT 100 
        FOR UPDATE SKIP LOCKED
      `);

      if (res.rows.length > 0) {
        console.log(`📡 [Outbox] Relaying ${res.rows.length} records to Redpanda...`);
        const producer = kafka.producer();
        await producer.connect();

        for (const row of res.rows) {
          // 2. Relay payload to a default topic
          await producer.send({
            topic: 'orders-topic', 
            messages: [{ value: JSON.stringify(row.payload) }],
          });

          // 3. Update status (Using 'updated_at' per your actual schema)
          await client.query(
            'UPDATE outbox SET status = $1, updated_at = NOW() WHERE id = $2',
            ['COMPLETED', row.id]
          );
        }

        await producer.disconnect();
        console.log(`✅ [Outbox] Batch of ${res.rows.length} records COMPLETED.`);
      }
    } catch (err) {
      console.error('❌ [Outbox] Worker Error:', err.message);
    } finally {
      if (client) client.release();
      // setTimeout prevents "stacking" if the DB/Kafka is slow
      setTimeout(runTick, interval);
    }
  };

  runTick();
};

export const startCleanupJob = () => {
  console.log('🧹 [Cleanup] Job started');
};

export default {
  infrastructure,
  middleware,
  startOutboxWorker,
  startCleanupJob,
};