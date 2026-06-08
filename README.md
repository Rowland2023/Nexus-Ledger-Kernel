# spring-fiat-core  
Stateless ledger microservice for banking rails. Spring Boot + Postgres.

**Core:** Double-entry ledger where DB enforces invariants, not app code.

**Key features:**
1. JWT + RBAC via reusable security starter
2. Event-driven audit trail using Spring Events  
3. Balance triggers: `CREATE CONSTRAINT TRIGGER check_balanced` — DB fails tx if books don't balance

**Use case:** Bank webhook ingestion. Prevents duplicate credits even if bank retries 10x.

**Stack:** Java 21, Spring Boot 3.4, PostgreSQL, JJWT, Docker
**Run:** `mvn spring-boot:run` — test with `POST /api/v1/ledger/transaction`

Built for ARCO/PAYCIS-style payment routing. Stateless = scales horizontally.
