🏛️ Lagos Shared-Kernel: B2B Banking Infrastructure
A high-performance, containerized, and event-driven Shared Kernel designed for mission-critical financial transactions. This project implements the Transactional Outbox Pattern to guarantee 100% data consistency between the Ledger (Postgres) and downstream Message Brokers (Redpanda/Kafka).

🚀 Performance Benchmarks (Local Dev)
Ledger Injection: ~150+ Transactions Per Second (TPS).

Outbox Relay: ~1,700+ Events Per Second (EPS).

Reliability: 100% Atomic Settlement (Zero-loss guarantee via Postgres CTEs).

🛠️ Tech Stack
Runtime: Node.js v24+ (ES6 Modules / ESM)

Database: PostgreSQL (Transactional Ledger & Outbox)

Cache/Locking: Redis

Messaging: Redpanda / Kafka (Event Streaming)

Orchestration: Docker & Docker Compose

📋 Prerequisites
Node.js: v24.13.0 or higher.

Docker: Installed and running.

Terminal Environment: All Node commands MUST be prefixed with NODE_NO_WARNINGS=1 to suppress internal infrastructure timeout warnings and maintain clean, actionable logs.

⚙️ Setup & Infrastructure
Install Dependencies:

Bash
npm install
Configure Environment:

Bash
cp .env.example .env
Spin up Containers:

Bash
docker-compose up -d
🔐 Security & Authentication
To interact with the protected ledger endpoints, you must generate a JWT.

Generate a Token:
Bash
node ../gen-token.js

Example Transaction (CURL):
Use the generated token to authorize a fund transfer:

Bash
curl -X POST http://localhost:3000/api/v1/ledger/transfer \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMTIzIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzczNTI4MjY3LCJleHAiOjE3NzM1MzE4Njd9.lHDa728QfGpVUZ5rA7ItdZkORCslSoI5dEhbO7ccjF4" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "acc_test_123",
    "amount": 250.00,
    "currency": "NGN",
    "type": "CREDIT"
  }'
🏃 Execution Commands
1. Start the Application
Bash
NODE_NO_WARNINGS=1 npm run start --workspace=my-node-project
2. Infrastructure Health Check
Bash
node ../shared-kernel/infrastructure/diagnostics/health.js
3. Stress Test & Benchmarking
Simulate heavy B2B load (100+ concurrent transfers) and trigger the high-speed Outbox Relay:

Bash
NODE_NO_WARNINGS=1 node scripts/stress-test.js
🏗️ Architectural Core: The Atomic Outbox
This kernel utilizes a Postgres Common Table Expression (CTE) to solve the "Distributed Transaction" problem. This ensures that a Ledger entry and its corresponding Outbox event are written in a single atomic unit of work—if one fails, the entire transaction rolls back.

Concurrency: The Relay worker utilizes FOR UPDATE SKIP LOCKED, allowing horizontal scaling across multiple containers without duplicate message delivery.

Batching: Events are drained in batches of 50 to optimize throughput.

📄 .env.example
Code snippet
# --- DATABASE ---
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=mydb

# --- REDIS ---
REDIS_HOST=127.0.0.1
REDIS_PORT=6380
REDIS_PASSWORD=

# --- KAFKA ---
KAFKA_BROKER=127.0.0.1:19092
KAFKAJS_NO_PARTITIONER_WARNING=1

# --- APP SETTINGS ---
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_key
🛡️ Development Standards
Strict ESM: All imports must include the .js extension.

Clean Logging: Always use the NODE_NO_WARNINGS=1 flag.