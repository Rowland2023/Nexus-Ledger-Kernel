# spring-fiat-core

Stateless ledger microservice for banking rails + account verification. Spring Boot + PostgreSQL.

**Core:** Double-entry ledger where DB enforces invariants, not app code. Built for bank webhook ingestion with exactly-once semantics.

**Key features:**
1. **Bank Account Verification** — CoP (UK), Plaid (US), SEPA (EU) adapters with fuzzy name matching to verify beneficiary accounts before payout
2. **JWT + RBAC** — Via `core-security-starter`. Stateless auth for multi-tenant fintech
3. **Balance Triggers** — `CREATE CONSTRAINT TRIGGER check_balanced` — DB rejects tx if debit != credit
4. **Idempotent Webhooks** — `UNIQUE(provider_ref)` + transactional outbox. Survives 10x bank retries
5. **Event Audit Trail** — Spring Events for compliance logs without coupling domains

**Use case:** Ingest bank webhooks from PAYCIS/ARCO-style rails. Verify accounts via CoP/Plaid, post to ledger, emit events to Kafka. Zero duplicate credits, zero unbalanced books.

**Stack:** Java 21, Spring Boot 3.4, PostgreSQL 15, JJWT, Docker, Testcontainers

**Run locally:**
```bash
docker compose up -d postgres
mvn spring-boot:run
curl -X POST localhost:8080/api/v1/ledger/transaction -H "Authorization: Bearer $JWT"
