// config/redis.js
import { redis } from '../infrastructure/cache/redis.cluster.js';

export async function checkAndSet(key, ttl = 60) {
  const result = await redis.set(key, 'processed', 'NX', 'EX', ttl);
  return result === 'OK'; // true if new, false if duplicate
}
