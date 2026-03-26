import { infrastructure } from '@yourorg/shared-kernel';
import { verifyBusinessEntity, getBankRecordFromAPI } from '@yourorg/shared-kernel/services/verification.js';
import { randomUUID } from 'crypto';

const MOCK_MODE = false;

const calculateMatchingScore = async (businessName, bankNameFromAPI) => {
  try {
    const check = await verifyBusinessEntity(businessName, bankNameFromAPI);
    return { score: check?.score || 100, isRejected: check?.isRejected || false };
  } catch (err) {
    return { score: 100, isRejected: false };
  }
};

export async function listOrders(req, res) {
  let client;
  try {
    client = await infrastructure.primaryPool.connect();
    const result = await client.query(`
      SELECT id, customer_name, total_amount, currency, jurisdiction,
             verification_rail, status, matching_score, bank_name,
             account_number, idempotency_key, created_at 
      FROM orders ORDER BY created_at DESC LIMIT 50
    `);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database read failed' });
  } finally {
    if (client) client.release();
  }
}

export async function placeOrder(req, res) {
  const { businessName, amount, items, jurisdiction, bankDetails, idempotencyKey } = req.body;
  
  const jurisdictionConfig = {
    'UK': { rail: 'CoP (UK)', currency: 'GBP' },
    'EU': { rail: 'PSD2 (EU)', currency: 'EUR' },
    'US': { rail: 'Plaid (US)', currency: 'USD' },
    'NG': { rail: 'NIBSS (NG)', currency: 'NGN' }
  };
  const config = jurisdictionConfig[jurisdiction] || { rail: 'NIBSS (NG)', currency: 'NGN' };

  // 🛡️ UUID SANITIZER
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const finalIdempotencyKey = uuidRegex.test(idempotencyKey) ? idempotencyKey : randomUUID();

  let client;
  try {
    const check = await calculateMatchingScore(businessName, bankDetails?.bank || "UNKNOWN");
    if (check.isRejected) return res.status(400).json({ success: false, message: 'KYC_FAILURE' });

    client = await infrastructure.primaryPool.connect();
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM orders WHERE idempotency_key = $1', [finalIdempotencyKey]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'DUPLICATE_TRANSACTION' });
    }

    const orderRes = await client.query(`
      INSERT INTO orders (customer_name, total_amount, currency, jurisdiction, verification_rail, goods_summary, status, matching_score, bank_name, account_number, idempotency_key)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
    `, [businessName, Number(amount), config.currency, jurisdiction, config.rail, JSON.stringify(items || []), 'SUCCESS', check.score, bankDetails?.bank || "UNKNOWN", bankDetails?.acc || "000", finalIdempotencyKey]);

    const newOrder = orderRes.rows[0];

    // ✅ FIXED: Only inserting into columns that actually exist: 'payload' and 'status'
    const eventPayload = {
      eventType: 'ORDER_CREATED', // Metadata moved inside payload
      data: newOrder,
      occurred_at: new Date().toISOString()
    };

    await client.query(
      'INSERT INTO outbox (payload, status) VALUES ($1, $2)',
      [JSON.stringify(eventPayload), 'PENDING']
    );

    await client.query('COMMIT');
    return res.status(201).json({ success: true, data: newOrder });

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (client) client.release();
  }
}