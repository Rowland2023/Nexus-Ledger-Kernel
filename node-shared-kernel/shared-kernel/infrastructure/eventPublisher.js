// infrastructure/eventPublisher.js
import { publishEvent } from './messaging/publisher.js';

// Example integration with Debezium CDC events
export async function publishCDCEvent(changeEvent) {
  await publishEvent('db.changes', changeEvent);
}
