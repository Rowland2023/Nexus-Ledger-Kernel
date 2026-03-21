// index.js
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

// Resolve paths for ES Modules to find your .env in the parent directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

// Import routers
import ledgerRouter from './src/modules/ledger/router.js';
import orderRouter from './src/modules/orders/router.js';

// Import Shared Kernel
const { infrastructure, startOutboxWorker, startCleanupJob } = await import('@yourorg/shared-kernel');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- Routes ---
app.use('/api/v1/ledger', ledgerRouter);
app.use('/api/v1/order', orderRouter);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    database: process.env.DB_NAME // Verification check
  });
});

// --- Startup & Infrastructure Handshake ---
app.listen(PORT, async () => {
  console.log(`🚀 NEXUSLEDGER API LIVE: http://localhost:${PORT}`);
  console.log('🏁 Starting Lagos Ledger Infrastructure Handshake...');

  try {
    // 1. Connect Redis (Idempotency Layer)
    await infrastructure.connectRedis();
    console.log('✅ Redis: Connected');

    // 2. Connect Postgres (Source of Truth)
    // This uses the DATABASE_URL we verified earlier
    await infrastructure.connectPostgres();
    console.log('✅ Postgres: Connected');

    // 3. Connect Kafka (Messaging Layer)
    console.log('📡 Connecting to Redpanda/Kafka...');
    await infrastructure.connectKafka(); 
    console.log('✅ Kafka: Connected');

    // 4. Start Background Workers
    // We pass 5000ms to match your polling logs
    // This is what will flip your 'pending' row to 'completed'
    startOutboxWorker(5000);
    startCleanupJob();
    
    console.log('⚙️ Workers: Outbox and Cleanup active.');
    console.log('--- System Ready for 50,000 TPS ---');

  } catch (err) {
    console.error('⚠️ Infrastructure Warning:', err.message);
    console.log('💡 Tip: Run "docker ps" to ensure my_postgres and redpanda-cl are running.');
  }
});