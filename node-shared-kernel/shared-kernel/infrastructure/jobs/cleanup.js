export function startCleanupJob() {
  console.log('📅 Scheduled: Outbox Cleanup (24h interval)');
  
  const run = async () => {
    try { await cleanupOutbox(); } 
    finally {
      // ✅ Using setTimeout instead of setInterval prevents the negative warning
      setTimeout(run, 24 * 60 * 60 * 1000); 
    }
  };
  
  // Delay the very first run by 1 minute to let the system stabilize
  setTimeout(run, 60000); 
}