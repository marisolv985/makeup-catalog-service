const CircuitBreaker = require('opossum');

function createCircuitBreaker(fn, options = {}) {
  const defaultOptions = {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 15000,
    volumeThreshold: 3,
  };

  const breaker = new CircuitBreaker(fn, { ...defaultOptions, ...options });

  breaker.on('open', () => {
    console.warn(`[CircuitBreaker] ABIERTO para ${fn.name}`);
  });
  breaker.on('halfOpen', () => {
    console.log(`[CircuitBreaker] Semi-abierto para ${fn.name}`);
  });
  breaker.on('close', () => {
    console.log(`[CircuitBreaker] Cerrado para ${fn.name}`);
  });
  breaker.on('fallback', () => {
    console.warn(`[CircuitBreaker] Fallback ejecutado para ${fn.name}`);
  });

  return breaker;
}

module.exports = { createCircuitBreaker };
