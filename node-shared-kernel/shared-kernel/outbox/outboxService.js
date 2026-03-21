// /shared/services/outboxService.js

// Add 'client' as a parameter so it can participate in the Order transaction
export async function saveOutboxEvent(client, event) {
  const query = 'INSERT INTO outbox (event_type, payload) VALUES ($1, $2)';
  // Use the passed-in client, not the pool!
  await client.query(query, [event.type, JSON.stringify(event.payload)]);
}