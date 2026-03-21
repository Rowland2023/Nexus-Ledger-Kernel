import { redis } from '../infrastructure/cache/redis.cluster.js'; 

/**
 * Reliability: Safety (Idempotency Check)
 */
export async function checkAndSet(key, ttl = 60) {
  try {
    // 🛡️ THE FIX: Only attempt the 'set' if the status is explicitly 'ready'.
    // If it is 'connecting', 'reconnecting', or 'end', we skip to prevent hanging.
    if (redis.status !== 'ready') {
       console.warn(`⚠️ Redis status is "${redis.status}". Skipping idempotency check to avoid hang.`);
       return true; // "Fail-open": Allow the request to proceed if Redis is down
    }

    // NX = Only set if key does not exist
    // EX = Set expiration time
    const result = await redis.set(key, 'processed', 'NX', 'EX', ttl);
    
    return result === 'OK'; 
  } catch (err) {
    console.error('❌ Idempotency Store Error:', err.message);
    // Returning true lets the transaction proceed even if Redis is failing.
    // Change to 'throw err' only if you want to block users when Redis is down.
    return true; 
  }
}