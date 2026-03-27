-- Create the Orders table with the columns you were missing
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    bank_name TEXT DEFAULT 'UNKNOWN',
    account_number TEXT DEFAULT '000',
    customer_name TEXT,
    total_amount DECIMAL(15, 2),
    currency TEXT DEFAULT 'NGN',
    verification_rail TEXT,
    matching_score INTEGER,
    idempotency_key UUID UNIQUE,
    status TEXT DEFAULT 'PENDING',
    jurisdiction TEXT DEFAULT 'NG',
    goods_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the Outbox table for the Shared Kernel Worker
CREATE TABLE IF NOT EXISTS outbox (
    id SERIAL PRIMARY KEY,
    aggregate_id TEXT,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Index for high-velocity outbox polling
CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox (created_at) WHERE status = 'PENDING';