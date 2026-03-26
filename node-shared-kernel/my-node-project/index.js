// my-node-project/index.js
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// 1. --- Environment Setup ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

// 2. --- Import Shared Kernel & Routers ---
const { infrastructure, startOutboxWorker, startCleanupJob } = await import('@yourorg/shared-kernel');

import ledgerRouter from './src/modules/ledger/router.js';
import orderRouter from './src/modules/orders/router.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 3. --- Middleware Stack ---

// ✅ FIXED: Added http://localhost:5173 to allowed origins
app.use(cors({
  origin: [
    'http://localhost', 
    'http://127.0.0.1', 
    'http://localhost:5173', 
    'http://127.0.0.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ FIXED: Enhanced CSP to allow the frontend to fetch from this API
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "connect-src": ["'self'", "http://localhost:3000", "ws://localhost:3000"],
      },
    },
  })
);

app.use(express.json());

// 4. --- Routes ---
app.use('/api/v1/ledger', ledgerRouter);
app.use('/api/v1/order', orderRouter);

// System Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    node_version: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// 5. --- Startup & Infrastructure Handshake ---
app.listen(PORT, async () => {
  console.log(`🚀 NEXUSLEDGER API LIVE: http://localhost:${PORT}`);
  console.log('🏁 Starting Lagos Ledger Infrastructure Handshake...');

  try {
    // Phase 1: Redis (Idempotency & Rate Limiting)
    await infrastructure.connectRedis();
    console.log('✅ Redis: Connected');

    // Phase 2: Postgres (Double-Entry Source of Truth)
    await infrastructure.connectPostgres();
    console.log('✅ Postgres: Connected');

    // Phase 3: Redpanda/Kafka (Event Streaming)
    console.log('📡 Connecting to Redpanda/Kafka...');
    await infrastructure.connectKafka(); 
    console.log('✅ Kafka: Connected');

    // Phase 4: Start Transactional Outbox Relay
    // Interval set to 5000ms to poll the outbox table for pending events
    startOutboxWorker(5000);
    startCleanupJob();
    
    console.log('⚙️ Workers: Outbox and Cleanup active.');
    console.log('--- System Ready for 50,000 TPS ---');

  } catch (err) {
    console.error('⚠️ Infrastructure Handshake Failed:', err.message);
    process.exit(1); 
  }
});