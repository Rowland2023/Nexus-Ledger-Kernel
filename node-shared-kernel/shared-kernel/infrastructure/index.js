// shared-kernel/infrastructure/index.js

import { primaryPool, connectPostgres } from './database/primary.pool.js';
import { kafka, connectKafka } from './messaging/kafka.client.js';

// If you don't have a redis file yet, keep this placeholder
const connectRedis = async () => {
    console.log('📡 [Infrastructure] Connecting to Redis...');
    // When you're ready: await redisClient.connect();
    console.log('✅ [Infrastructure] Redis Placeholder Active');
};

export default {
  primaryPool, // The raw PG Pool instance
  kafka,       // The raw Kafka instance
  connectRedis,
  connectPostgres, // Now correctly wires to the logic in primary.pool.js
  connectKafka     // Now correctly wires to the logic in kafka.client.js
};