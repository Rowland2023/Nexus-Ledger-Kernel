// infrastructure/resilience/circuitBreaker.js
import CircuitBreaker from 'opossum';

export function createBreaker(
  action,
  options = { timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 10000 }
) {
  return new CircuitBreaker(action, options);
}
