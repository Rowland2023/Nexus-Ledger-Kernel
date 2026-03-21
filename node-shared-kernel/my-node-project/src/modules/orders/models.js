import Joi from 'joi';
import { infrastructure } from '@yourorg/shared-kernel';

/**
 * 1. Validation Schema
 */
export const orderSchema = Joi.object({
  customer_id: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      qty: Joi.number().integer().min(1).required()
    })
  ).required(),
  total: Joi.number().positive().required()
});

/**
 * 2. Get Database Client
 */
export async function getClient() {
  // Accessing the pool through the infrastructure object
  const pool = infrastructure.primaryPool?.primaryPool || infrastructure.primaryPool;
  
  if (!pool || typeof pool.connect !== 'function') {
    throw new Error('Database primaryPool not found in infrastructure.');
  }

  return await pool.connect();
}

/**
 * 3. Create Order and Items
 */
export async function createOrder(data, client) {
  // Insert Parent Order
  const orderQuery = `
    INSERT INTO orders (customer_id, total, status) 
    VALUES ($1, $2, 'pending') 
    RETURNING id, customer_id, total, status, created_at;
  `;
  
  const orderRes = await client.query(orderQuery, [data.customer_id, data.total]);
  
  if (!orderRes.rows || orderRes.rows.length === 0) {
    throw new Error('Failed to create order record in database.');
  }

  const order = orderRes.rows[0];

  // Bulk Insert Order Items
  if (data.items && data.items.length > 0) {
    const itemValues = [];
    const placeholders = data.items.map((item, index) => {
      const offset = index * 3;
      itemValues.push(order.id, item.id, item.qty);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
    }).join(',');

    const itemsQuery = `
      INSERT INTO order_items (order_id, item_id, quantity) 
      VALUES ${placeholders}
      RETURNING *;
    `;
    
    const itemsRes = await client.query(itemsQuery, itemValues);
    order.items = itemsRes.rows;
  }

  return order;
}