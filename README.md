# node-fiat-core

Stateless ledger microservice for banking rails + account verification. Node.js + PostgreSQL.

**Core:** Double-entry ledger where DB enforces invariants, not app code. Built for bank webhook ingestion with exactly-once semantics.

**Key features:**
1. **Bank Account Verification** — CoP (UK), Plaid (US), SEPA (EU) adapters with fuzzy name matching
2. **JWT + RBAC** — Stateless auth via `jsonwebtoken` + middleware
3. **Balance Triggers** — `CREATE CONSTRAINT TRIGGER check_balanced` — DB rejects tx if debit != credit  
4. **Idempotent Webhooks** — `UNIQUE(provider_ref)` + transactional outbox via BullMQ
5. **Event Audit Trail** — Emits to Kafka/Redpanda for compliance

**Use case:** Ingest PAYCIS/ARCO-style webhooks. Verify accounts, post to ledger, emit events. Zero duplicates.

**Stack:** Node.js 20, Fastify, PostgreSQL 15, Prisma, BullMQ, Docker, Testcontainers

**Run locally:**
```bash
docker compose up -d
npm install && npm run migrate
npm run dev
