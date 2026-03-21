// infrastructure/messaging/publisher.js
import { producer } from './kafka.client.js';

export async function publishEvent(topic, message) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}
