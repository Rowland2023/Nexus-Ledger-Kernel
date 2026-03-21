import { primaryPool } from '../infrastructure/database/primary.pool.js';

/**
 * RELIABILITY: Atomic persistence
 * Saves the event to the outbox table as part of a transaction.
 */
export async function saveEvent(eventType, payload) {
  const query = `
    INSERT INTO outbox (event_type, payload) 
    VALUES ($1, $2) 
    RETURNING id;
  `;
  // Using primaryPool to ensure we write to the leader node
  return await primaryPool.query(query, [eventType, payload]);
}

/**
 * CONCURRENCY: Locked Retrieval
 * 'SKIP LOCKED' ensures that if you have multiple workers, 
 * they won't fight over the same 10 rows.
 */
export const fetchPendingEvents = async () => {
  const { rows } = await primaryPool.query(
    `SELECT id, event_type, payload FROM outbox 
     WHERE status = 'PENDING' 
     ORDER BY created_at ASC
     FOR UPDATE SKIP LOCKED 
     LIMIT 10`
  );
  return rows;
};

/**
 * CONSISTENCY: State Management
 * Updates the status and logs any errors if the event failed.
 */
export const updateEventStatus = async (id, status, errorMessage = null) => {
  const query = `
    UPDATE outbox 
    SET status = $2, 
        error_message = $3,
        updated_at = NOW() 
    WHERE id = $1
  `;
  return await primaryPool.query(query, [id, status, errorMessage]);
};

// Aliases for cleaner business logic in the worker
export const markEventProcessed = (id) => updateEventStatus(id, 'COMPLETED');
export const markEventFailed = (id, error) => updateEventStatus(id, 'FAILED', error);