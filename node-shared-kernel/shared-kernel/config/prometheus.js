// config/prometheus.js
import client from 'prom-client';

const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ register });

export { client, register };
