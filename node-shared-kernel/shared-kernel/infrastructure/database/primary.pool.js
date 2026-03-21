import pg from 'pg';
const { Pool } = pg;

/**
 * PostgreSQL Connection Pool
 * Hardened with explicit type casting to prevent SASL/String errors
 * during infrastructure bootstrapping.
 */
export const primaryPool = new Pool({
  // Ensure host is a string
  host: String(process.env.DB_HOST || 'localhost'),
  
  // Ensure port is a number
  port: Number(process.env.DB_PORT || 5432),
  
  // Ensure user is a string
  user: String(process.env.DB_USER || 'postgres'),
  
  // CRITICAL: Force password to a string to prevent 
  // "client password must be a string" error if .env is missing
  password: String(process.env.DB_PASSWORD || 'password123'),
  
  // Ensure database name is a string
  database: String(process.env.DB_NAME || 'security_db'),

  // Banking-grade resilience settings
  max: 20,                          // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,         // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000,    // How long to wait for a connection before timing out
});

/**
 * Connection initializer used by the bootstrap process
 */
export const connectPostgres = async () => {
  try {
    const client = await primaryPool.connect();
    
    // Verify the connection with a simple query
    await client.query('SELECT 1');
    
    console.log(`✅ Postgres connected to: ${process.env.DB_NAME || 'security_db'}`);
    
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Postgres connection failed:', err.message);
    // In a B2B Advisory context, we throw here to prevent the app 
    // from starting in a "zombie" state.
    throw err;
  }
};