// shared-kernel/index.js
import { primaryPool, connectPostgres } from './infrastructure/database/primary.pool.js';
import { kafka, connectKafka } from './infrastructure/messaging/kafka.client.js';
import { idempotencyMiddleware } from './middleware/idempotency.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Redis connection (replace with actual Redis client later)
export async function connectRedis() {
  console.log('📡 Connecting to Redis...');
  console.log('✅ Redis Connected');
}

export async function enqueueTransfer(transfer) {
  console.log('📨 Enqueuing transfer:', transfer);

  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic: 'ledger-transfers',
    messages: [{ value: JSON.stringify(transfer) }],
  });
  await producer.disconnect();

  console.log('✅ Transfer enqueued to Kafka');
}

export const infrastructure = {
  connectRedis,       // <-- ensure this is included
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

export const startOutboxWorker = (interval) => {
  console.log(`📦 Outbox Worker started with interval: ${interval}ms`);
};

export const startCleanupJob = () => {
  console.log('🧹 Cleanup Job started');
};

export default {
  infrastructure,
  middleware,
  startOutboxWorker,
  startCleanupJob,
};
