// consumer.js
import { infrastructure } from '@yourorg/shared-kernel';
const { kafka, primaryPool } = infrastructure; 

const consumer = kafka.consumer({ groupId: 'ledger-group' });

const runConsumer = async () => {
  try {
    await consumer.connect();
    console.log('✅ Kafka Consumer Connected');
    await consumer.subscribe({ topic: 'FUNDS_TRANSFERRED', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value.toString());
        const eventId = payload.eventId; // ID passed from Outbox

        const client = await primaryPool.connect();
        try {
          await client.query('BEGIN');

          // 1. IDEMPOTENCY CHECK
          const { rowCount } = await client.query(
            'INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING',
            [eventId]
          );

          if (rowCount === 0) {
            console.log(`ℹ️ Event ${eventId} already processed. Skipping...`);
            await client.query('ROLLBACK');
            return;
          }

          // 2. BUSINESS LOGIC
          console.log(`\n🎉 [Event Received] Topic: ${topic}`);
          console.log(`💰 Transfer: From ${payload.fromUserId} to ${payload.toUserId} ($${payload.amount})`);
          
          // Trigger actual decoupled logic here (e.g. email notification)

          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`❌ Error processing event ${eventId}:`, err.message);
          throw err; // Kafka will retry the message
        } finally {
          client.release();
        }
      },
    });
  } catch (err) {
    console.error('❌ Consumer Error:', err.message);
  }
};

runConsumer();