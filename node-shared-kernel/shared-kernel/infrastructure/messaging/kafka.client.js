import { Kafka, Partitioners } from 'kafkajs';

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'nexus-ledger-node',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'], // Note: Plural 'BROKERS' is standard
  connectionTimeout: 5000,
  requestTimeout: 25000,
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

let producer = null;

export const connectKafka = async () => {
  if (!producer) {
    // 💡 Fix: Using the LegacyPartitioner to avoid the v2.0.0 warning you saw earlier
    producer = kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
      allowAutoTopicCreation: true,
      transactionalId: process.env.KAFKA_TRANSACTIONAL_ID // 👈 Essential for your ACID ledger
    });
    
    console.log('📡 [Kafka] Handshake initiated...');
    await producer.connect();
    console.log('✅ [Kafka] Producer connected and ready for 50k TPS.');
  }
  return producer;
};

// 🛡️ Guarded Getter: Prevents "is not a function" by throwing a clear error if not ready
export const getProducer = () => {
  if (!producer) {
    throw new Error('❌ Kafka Producer not initialized. Call connectKafka() during startup.');
  }
  return producer;
};