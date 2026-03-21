import { Kafka } from 'kafkajs';

// 1. Initialize the instance with explicit timeouts
export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'my-app',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  // Adding these helps resolve the TimeoutNegativeWarning
  connectionTimeout: 3000,
  requestTimeout: 25000, 
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

let producer = null;

// 2. Define the connection logic
export const connectKafka = async () => {
  if (producer) return producer;
  
  // Optional: Add a log to see exactly when the connection starts
  console.log('📡 [Kafka] Initializing producer connection...');
  
  producer = kafka.producer();
  await producer.connect();
  return producer;
};

// 3. Define the getter
export const getProducer = () => producer;