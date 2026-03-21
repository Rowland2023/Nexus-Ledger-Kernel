export function startOutboxWorker(intervalMs = 5000) {
  const run = async () => {
    const startTime = Date.now();
    try {
      await processOutbox();
    } catch (err) {
      console.error('❌ Outbox Loop Error:', err.message);
    }

    const duration = Date.now() - startTime;
    let nextDelay = intervalMs - duration;

    // ✅ Guard against negative or too small values
    if (nextDelay < 100) {
      nextDelay = 100;
    }

    setTimeout(run, nextDelay);
  };

  console.log(`🔄 Outbox Processor Active (${intervalMs}ms interval)`);
  run();
}
