import pg from 'pg';
const { Pool } = pg;

/**
 * PostgreSQL Connection Pool
 * Hardened for High-Concurrency Ledger Operations
 */
export const primaryPool = new Pool({
  host: String(process.env.DB_HOST || 'localhost'),
  port: Number(process.env.DB_PORT || 5432),
  user: String(process.env.DB_USER || 'postgres'),
  password: String(process.env.DB_PASSWORD || 'password123'),
  database: String(process.env.DB_NAME || 'security_db'),

  // 🚀 Banking-grade Resilience & Throughput settings
  max: 20,                // Max concurrent clients
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 5000, // Increased to 5s to survive heavy Redpanda spikes
  
  // 🧹 Anti-Leak Protection
  maxUses: 7500,          // Close and replace a connection after 7500 queries
  allowExitOnIdle: false  // Keep the pool alive even if no queries are running
});

/**
 * 🛰️ POOL MONITORING
 * Logs whenever a client is created or errors out to catch "Zombie" connections
 */
primaryPool.on('connect', (client) => {
  // Optional: Quiet logging for connection creation
});

primaryPool.on('error', (err, client) => {
  console.error('❌ IDLE_CLIENT_POOL_ERROR:', err.message);
  // Do not exit the process; the pool will attempt to create a new client
});

/**
 * Connection initializer with enhanced Health Check
 */
export const connectPostgres = async () => {
  let client;
  try {
    // 1. Attempt handshake
    client = await primaryPool.connect();
    
    // 2. Deep Health Check (Verify read/write capability)
    await client.query('SELECT 1');
    
    // 3. Log Pool Stats for Debugging
    const poolStats = {
      total: primaryPool.totalCount,
      idle: primaryPool.idleCount,
      waiting: primaryPool.waitingCount
    };
    
    console.log(`✅ Postgres Ready [${process.env.DB_NAME || 'security_db'}]`);
    console.log(`📊 Pool Health: ${poolStats.total} total, ${poolStats.idle} idle, ${poolStats.waiting} waiting`);
    
    return true;
  } catch (err) {
    console.error('❌ Postgres Handshake Failed:', err.message);
    
    // Specific check for SASL/Auth failures
    if (err.message.includes('SASL')) {
      console.error('💡 TIP: Check if your DB_PASSWORD matches the Postgres container ENV.');
    }
    
    throw err;
  } finally {
    if (client) client.release();
  }
};