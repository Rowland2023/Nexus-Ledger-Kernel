import { infrastructure } from '@yourorg/shared-kernel';
import { verifyBusinessEntity } from '@yourorg/shared-kernel/services/verification.js';

/**
 * ✅ FETCH RECENT ORDERS
 * Used by the BUSINESS_OPS frontend tab
 */
export async function listOrders(req, res) {
  let client;
  try {
    client = await infrastructure.primaryPool.connect();
    const result = await client.query(`
      SELECT id, customer_name, total_amount, status, matching_score, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 50
    `);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ LIST_ORDERS_ERROR:', error.message);
    return res.status(500).json({ success: false, message: 'Database read failed' });
  } finally {
    if (client) client.release();
  }
}

/**
 * ✅ ATOMIC ORDER PLACEMENT (KYC + TRANSACTIONAL OUTBOX)
 */
export async function placeOrder(req, res) {
  const { businessName, bankNameFromAPI, amount, items } = req.body;
  let client;

  try {
    // 🔍 1. PRE-DB VERIFICATION (Normalization & Fuzzy Match)
    // We do this BEFORE opening a DB connection to keep the pool efficient
    const check = await verifyBusinessEntity(businessName, bankNameFromAPI);
    
    if (check.isRejected) {
      return res.status(400).json({ 
        success: false, 
        message: 'KYC_MATCH_FAILURE',
        score: check.score 
      });
    }

    // 🔗 2. ACID TRANSACTION (The "Dual Write")
    client = await infrastructure.primaryPool.connect();
    await client.query('BEGIN'); 

    // A. Insert the Order (Source of Truth)
    const orderQuery = `
      INSERT INTO orders (customer_name, total_amount, goods_summary, status, matching_score)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const orderValues = [
      businessName, 
      Number(amount), 
      JSON.stringify(items || []), 
      'COMPLETED', 
      check.score
    ];
    const orderRes = await client.query(orderQuery, orderValues);
    const newOrder = orderRes.rows[0];

    // B. Insert into Outbox (The Event Relay)
    // This ensures Kafka is notified even if the worker restarts later
    const eventPayload = {
      event: 'ORDER_COMPLETED',
      data: newOrder,
      occurred_at: new Date().toISOString(),
      metadata: { source: 'nexus-ledger-api' }
    };

    await client.query(
      'INSERT INTO outbox (payload, status) VALUES ($1, $2)',
      [eventPayload, 'PENDING']
    );

    // ✅ COMMIT BOTH: Order is saved AND event is queued
    await client.query('COMMIT'); 

    console.log(`✅ Order ${newOrder.id} Placed & Outbox Queued.`);
    
    return res.status(201).json({ 
      success: true, 
      data: newOrder 
    });

  } catch (error) {
    if (client) await client.query('ROLLBACK'); 
    console.error('❌ TRANSACTION_FAILED:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (client) client.release();
  }
}