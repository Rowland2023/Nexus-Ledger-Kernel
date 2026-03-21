import Redis from 'ioredis';

// 1. Config logic (Keep your existing password/config code here)
const config = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6380,
  mode: process.env.REDIS_MODE || 'standalone',
};

let redisInstance = null;

/**
 * ✅ THE FIX: Wrap the instance and use lazyConnect
 */
export const connectRedis = async () => {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: config.host,
      port: config.port,
      lazyConnect: true, // 🛡️ CRITICAL: Stops the "Ghost" timer on startup
      retryStrategy: (times) => Math.min(times * 2000, 30000),
    });

    redisInstance.on('connect', () => console.log(`📡 Redis: Connecting...`));
    redisInstance.on('ready', () => console.log(`🚀 Redis: Ready (${config.mode})`));
  }

  if (redisInstance.status === 'wait' || redisInstance.status === 'close') {
    await redisInstance.connect();
  }
  return redisInstance;
};

// Export the instance for your cache logic (set/get)
export { redisInstance as redis };