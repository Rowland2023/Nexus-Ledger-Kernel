async function monitor() {
  console.clear();
  // Dynamically import your health check
  const { runFullDiagnostic } = await import('../../shared-kernel/infrastructure/diagnostics/health.js');
  await runFullDiagnostic();
  setTimeout(monitor, 2000); // Runs every 2 seconds
}
monitor();