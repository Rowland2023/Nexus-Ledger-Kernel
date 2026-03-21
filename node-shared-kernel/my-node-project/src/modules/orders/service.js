import { infrastructure } from '@yourorg/shared-kernel';
import { saveOutboxEvent } from '../../../../shared-kernel/outbox/outbox.repository.js';

const { primaryPool } = infrastructure;

export async function createOrder(orderData) {
  // 1. Get a dedicated client for the transaction
  const client = await primaryPool.connect();

  try {
    await client.query('BEGIN');

    // 2. Insert the Order
    const orderResult = await client.query(
      'INSERT INTO orders (product_id, quantity) VALUES ($1, $2) RETURNING *',
      [orderData.product_id, orderData.quantity]
    );
    const newOrder = orderResult.rows[0];

    // 3. Insert the Outbox Event (using the SAME client/transaction)
    // We pass 'client' as the first argument so it uses the transaction
    await saveOutboxEvent(client, {
      type: 'ORDER_CREATED',
      payload: {
        order_id: newOrder.id,
        product_id: newOrder.product_id,
        quantity: newOrder.quantity,
        created_at: newOrder.created_at
      }
    });

    // 4. Commit everything
    await client.query('COMMIT');
    return newOrder;

  } catch (error) {
    // 5. If ANYTHING fails, roll back both inserts
    await client.query('ROLLBACK');
    console.error('❌ Transaction failed, rolled back:', error.message);
    throw error;
  } finally {
    // 6. Always release the client back to the pool
    client.release();
  }
}