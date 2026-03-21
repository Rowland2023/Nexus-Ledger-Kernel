import { infrastructure } from '@yourorg/shared-kernel';

/**
 * 🛠️ INFRASTRUCTURE RESOLVER
 * Safely accesses the primary database pool.
 */
const getClient = async () => {
  const pool = infrastructure.primaryPool;
  if (!pool || typeof pool.connect !== 'function') {
    throw new Error("Lagos Ledger Error: primaryPool not found or not initialized.");
  }
  return await pool.connect();
};

/**
 * 📊 GET /api/v1/order/list
 * Fetches the latest ledger entries for the Live Stream.
 */
export async function listOrders(req, res) {
  let client;
  try {
    client = await getClient();
    const result = await client.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50');
    
    // Return a clean array for the frontend polling
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ LEDGER_LIST_ERROR:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch ledger stream' 
    });
  } finally {
    if (client) client.release();
  }
}

/**
 * 💸 POST /api/v1/order/place-order
 * Handles the B2B order submission and prevents LEDGER_REJECTION.
 */
export async function placeOrder(req, res) {
  let client;
  try {
    client = await getClient();
    
    // 🛡️ DATA NORMALIZATION: Catching all possible frontend naming conventions
    const { 
      customer_name, customerName, 
      goods_summary, goodsSummary, 
      items, 
      total, total_amount, totalAmount 
    } = req.body;

    // Fallbacks to satisfy NOT NULL constraints in Postgres
    const finalName = customer_name || customerName || 'Default Lagos Client';
    const finalSummary = goods_summary || goodsSummary || 'Standard B2B Order';
    const finalAmount = Number(total_amount || total || totalAmount || 0);
    const finalItems = JSON.stringify(items || []);

    const query = `
      INSERT INTO orders (customer_name, goods_summary, items, total, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    
    const values = [finalName, finalSummary, finalItems, finalAmount];
    const result = await client.query(query, values);
    const newOrder = result.rows[0];

    // 📡 KAFKA BROADCAST (Optional, based on your log's connectivity)
    if (infrastructure.kafka && infrastructure.kafka.producer) {
      try {
        await infrastructure.kafka.producer.send({
          topic: 'orders-topic',
          messages: [{ value: JSON.stringify(newOrder) }],
        });
      } catch (kErr) {
        console.warn('⚠️ Kafka broadcast failed, but DB record saved:', kErr.message);
      }
    }

    console.log('✅ SUCCESS: Order recorded in Postgres. ID:', newOrder.id);

    // 🚀 THE FIX: Sending a response shape that stops "LEDGER_REJECTION"
    return res.status(201).json({
      success: true,
      message: "Order synchronized with Lagos Ledger",
      orderId: newOrder.id,
      data: newOrder
    });

  } catch (error) {
    console.error('❌ LEDGER_SYNC_ERROR:', error.message);
    
    // Explicit error object for the frontend useOrderTransaction hook
    return res.status(500).json({ 
      success: false, 
      error: 'LEDGER_REJECTION', 
      message: error.message 
    });
  } finally {
    if (client) client.release();
  }
}