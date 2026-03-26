import { infrastructure } from '@yourorg/shared-kernel';
import { verifyBusinessEntity, getBankRecordFromAPI } from '@yourorg/shared-kernel/services/verification.js';

// ==========================================
// 🧪 MOCK CONFIGURATION
// Set to 'true' to force a Mismatch Failure for demos
// ==========================================
const MOCK_MODE = false; 
// ==========================================

/**
 * ✅ FETCH RECENT ORDERS
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

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ LIST_ORDERS_ERROR:', error.message);
    return res.status(500).json({ success: false, message: 'Database read failed' });
  } finally {
    if (client) client.release();
  }
}

/**
 * ✅ ATOMIC ORDER PLACEMENT
 */
export async function placeOrder(req, res) {
  let { businessName, bankNameFromAPI, amount, items } = req.body;
  let client;

  try {
    // ==========================================
    // 🧪 MOCK INTERCEPTION
    // ==========================================
    if (MOCK_MODE) {
       // Ignore the frontend's 'bankNameFromAPI' and use the forced mismatch instead
       bankNameFromAPI = await getBankRecordFromAPI("0123456789");
       console.log(`🔍 [DEMO MODE] Intercepted Bank API. Comparing [${businessName}] against Mock [${bankNameFromAPI}]`);
    }
    // ==========================================

    // 🔍 1. PRE-DB VERIFICATION
    const check = await verifyBusinessEntity(businessName, bankNameFromAPI);
    
    if (check.isRejected) {
      console.warn(`🛑 KYC REJECTED: Score ${check.score}% for ${businessName}`);
      return res.status(400).json({ 
        success: false, 
        message: 'KYC_MATCH_FAILURE',
        score: check.score,
        actual_record: bankNameFromAPI
      });
    }

    // 🔗 2. ACID TRANSACTION
    client = await infrastructure.primaryPool.connect();
    await client.query('BEGIN'); 

    const orderQuery = `
      INSERT INTO orders (customer_name, total_amount, goods_summary, status, matching_score)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const orderValues = [
      businessName, 
      Number(amount), 
      JSON.stringify(items || []), 
      'SUCCESS', 
      check.score
    ];
    const orderRes = await client.query(orderQuery, orderValues);
    const newOrder = orderRes.rows[0];

    // Transactional Outbox Insert
    const eventPayload = {
      event: 'ORDER_COMPLETED',
      data: newOrder,
      occurred_at: new Date().toISOString()
    };

    await client.query(
      'INSERT INTO outbox (payload, status) VALUES ($1, $2)',
      [eventPayload, 'PENDING']
    );

    await client.query('COMMIT'); 
    
    return res.status(201).json({ success: true, data: newOrder });

  } catch (error) {
    if (client) await client.query('ROLLBACK'); 
    console.error('❌ TRANSACTION_FAILED:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (client) client.release();
  }
}