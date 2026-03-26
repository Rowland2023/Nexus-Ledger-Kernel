import { infrastructure } from '@yourorg/shared-kernel';
import { verifyBusinessEntity } from '@yourorg/shared-kernel/services/verification.js';

/**
 * ✅ FETCH LEDGER ENTRIES
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
 * ✅ ATOMIC ORDER PLACEMENT
 */
export async function placeOrder(req, res) {
  let client;
  try {
    const { businessName, bankNameFromAPI, amount, items } = req.body;
    
    // 🔍 1. VERIFICATION (Pre-DB check to save connection pool)
    const check = await verifyBusinessEntity(businessName, bankNameFromAPI);
    if (check.isRejected) {
      return res.status(400).json({ success: false, message: 'KYC_MATCH_FAILURE' });
    }

    // ✅ 2. ACID WRITE with Transaction
    client = await infrastructure.primaryPool.connect();
    await client.query('BEGIN'); // Start Transaction

    const query = `
      INSERT INTO orders (
        customer_name, 
        total_amount, 
        goods_summary, 
        status, 
        matching_score, 
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `;

    const values = [
      businessName, 
      Number(amount), 
      JSON.stringify(items || []), 
      'SUCCESS', 
      check.score
    ];

    const result = await client.query(query, values);
    
    await client.query('COMMIT'); // Commit Transaction
    
    return res.status(201).json({ success: true, orderId: result.rows[0].id });

  } catch (error) {
    if (client) await client.query('ROLLBACK'); // Rollback on failure
    console.error('❌ LEDGER_SYNC_ERROR:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (client) client.release();
  }
}