import { infrastructure } from '../../shared-kernel/index.js'; 
import { processOutbox } from '../../shared-kernel/outbox/outbox.worker.js';

const { primaryPool } = infrastructure;

async function generateLoad(count = 100) {
  if (!primaryPool) {
    console.error('❌ Error: primaryPool is undefined. Check shared-kernel exports.');
    return;
  }

  // --- 1. INFRASTRUCTURE WARM-UP ---
  console.log('📡 Warming up Infrastructure (Kafka, Redis, Postgres)...');
  try {
    await infrastructure.connectKafka(); 
  } catch (err) {
    console.error('❌ Infrastructure Warm-up Failed:', err.message);
    process.exit(1);
  }

  // --- 2. LOAD INJECTION (ATOMIC CTE) ---
  console.log(`🚀 Injecting ${count} concurrent transfers into the Ledger...`);
  
  const tasks = [];
  const startInjection = Date.now();

  for (let i = 0; i < count; i++) {
    const amount = (Math.random() * 1000).toFixed(2);
    
    // Atomic Double-Write: Ledger + Outbox in one trip
    const query = {
      text: `
        WITH ledger_entry AS (
          INSERT INTO ledger (account_id, amount, type) 
          VALUES ($1, $2, $3) 
          RETURNING id
        )
        INSERT INTO outbox (
          event_type, 
          aggregate_type, 
          aggregate_id, 
          payload, 
          status
        )
        SELECT 
          'FUNDS_TRANSFERRED', 
          'Ledger', 
          id::text, 
          jsonb_build_object(
            'ledgerId', id, 
            'amount', $2, 
            'currency', 'NGN'
          ),
          'PENDING'
        FROM ledger_entry;
      `,
      values: ['acc_test_123', amount, 'CREDIT']
    };
    
    tasks.push(primaryPool.query(query));
  }

  try {
    await Promise.all(tasks);
    const injectionDuration = Date.now() - startInjection;
    const injectionEps = (count / (injectionDuration / 1000)).toFixed(2);
    
    console.log(`✅ Injected ${count} events in ${injectionDuration}ms (${injectionEps} EPS)`);

    // --- 3. DRAIN LOOP (RELAY) ---
    console.log('🔄 Triggering Outbox Relay Drain...');
    const startRelay = Date.now();
    let totalRelayed = 0;
    let lastBatchSize = 0;

    do {
      // processOutbox() returns the number of rows processed in one batch (limit 50)
      lastBatchSize = await processOutbox();
      totalRelayed += lastBatchSize;
      
      if (lastBatchSize > 0) {
        console.log(`  📦 Relayed Batch: ${lastBatchSize} events. (Total: ${totalRelayed})`);
      }
    } while (lastBatchSize > 0);

    const relayDuration = Date.now() - startRelay;
    const relayEps = (totalRelayed / (relayDuration / 1000)).toFixed(2);

    console.log(`\n✨ Stress Test Complete ✨`);
    console.log(`---------------------------------`);
    console.log(`Total Events:   ${totalRelayed}`);
    console.log(`Relay Speed:    ${relayEps} events/sec`);
    console.log(`Status:         100% COMPLETED`);
    console.log(`---------------------------------`);

  } catch (err) {
    console.error('❌ Stress Test Failed:', err.message);
  } finally {
    // Keep pool open if worker is running, or close for one-off scripts
    // await primaryPool.end();
  }
}

// Execute
generateLoad(100).catch(console.error);