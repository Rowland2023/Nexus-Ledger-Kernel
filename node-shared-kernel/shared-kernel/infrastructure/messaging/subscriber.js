// 1. Import the initialization tools from your client
import { kafka, getProducer, connectKafka } from './kafka.client.js'; 

/**
 * 2. Initialize the Consumer (Subscriber Logic)
 * This part handles incoming messages from other services.
 */
export const startSubscriber = async (topic, groupId) => {
  const consumer = kafka.consumer({ groupId });
  
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`📥 [Subscriber] Received: ${message.value.toString()}`);
      // Add your business logic here (e.g., updating a read-model or cache)
    },
  });
};

/**
 * 3. DYNAMIC EXPORT
 * DO NOT do: const producer = getProducer(); export { producer };
 * Instead, re-export the function so callers always get the live instance.
 */
export { getProducer }; 

// Optional: A helper to ensure Kafka is ready before the subscriber starts
export const initMessaging = async () => {
  await connectKafka(); // Ensures producer is ready
  console.log('✅ [Messaging] System initialized.');
};