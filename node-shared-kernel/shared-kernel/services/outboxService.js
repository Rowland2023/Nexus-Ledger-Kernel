// services/outbox.service.js
export const createOutboxService = (db, producer) => ({
  async processOutbox() {
    // Your SQL SELECT and Kafka Producer logic goes here
    console.log("📡 Polling outbox for pending events...");
  }
});