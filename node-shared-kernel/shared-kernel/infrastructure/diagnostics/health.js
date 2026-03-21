import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 1. Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to find the .env file by walking up the tree
let envPath = path.resolve(__dirname, '../../../../.env');
if (!fs.existsSync(envPath)) {
    // Fallback for different execution contexts
    envPath = path.resolve(process.cwd(), '.env');
}

config({ path: envPath });

// 2. Named Imports (Match your primary.pool.js and kafka.client.js)
import { primaryPool } from '../database/primary.pool.js';
import { kafka } from '../messaging/kafka.client.js';

async function runHealthCheck() {
  console.log('🩺 [Lagos Infrastructure] Starting System Health Check...');
  console.log(`Config loaded from: ${envPath}`);
  
  const results = [];

  // --- Postgres Check ---
  try {
    const client = await primaryPool.connect();
    await client.query('SELECT 1');
    client.release();
    results.push({ resource: 'Postgres', status: '✅ UP', info: 'Connection Active' });
  } catch (err) {
    results.push({ resource: 'Postgres', status: '❌ DOWN', info: err.message });
  }

  // --- Kafka Check ---
  try {
    const admin = kafka.admin();
    await admin.connect();
    const cluster = await admin.describeCluster();
    await admin.disconnect();
    results.push({ 
        resource: 'Kafka', 
        status: '✅ UP', 
        info: `Cluster ID: ${cluster.clusterId} | Brokers: ${cluster.brokers.length}` 
    });
  } catch (err) {
    results.push({ resource: 'Kafka', status: '❌ DOWN', info: err.message });
  }

  // --- Redis Check (Placeholder for your config) ---
  // If you have a redis client exported, add a simple .ping() check here.

  console.table(results);
  
  // Exit with error code if any service is down (useful for CI/CD)
  const allUp = results.every(r => r.status.includes('✅'));
  process.exit(allUp ? 0 : 1);
}

runHealthCheck();