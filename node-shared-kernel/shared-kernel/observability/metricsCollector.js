// /shared/observability/httpMetrics.js
import { client, register } from '../config/prometheus.js';

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestDuration);

export function recordHttpMetrics(method, route, statusCode, duration) {
  httpRequestDuration.labels(method, route, statusCode).observe(duration);
}

export const idempotencyHitCounter = new client.Counter({
  name: 'idempotency_hits_total',
  help: 'Number of duplicate requests blocked by idempotency key',
});

export { register };
