const CircuitBreaker = require('opossum');

const defaultOptions = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
  volumeThreshold: 3,
};

function createCircuitBreaker(fn, options = {}) {
  const breaker = new CircuitBreaker(fn, { ...defaultOptions, ...options });

  breaker.on('open', () => {
    console.log(`[CircuitBreaker] ABIERTO - fallos detectados`);
  });

  breaker.on('halfOpen', () => {
    console.log(`[CircuitBreaker] MEDIO ABIERTO - probando recuperación`);
  });

  breaker.on('close', () => {
    console.log(`[CircuitBreaker] CERRADO - servicio restaurado`);
  });

  breaker.on('fallback', () => {
    console.log(`[CircuitBreaker] FALLBACK - respuesta de emergencia`);
  });

  return breaker;
}

function circuitBreakerMiddleware(breaker, fallbackFn) {
  if (fallbackFn) {
    breaker.fallback(fallbackFn);
  }

  return async (req, res, next) => {
    try {
      const result = await breaker.fire(req, res);
      if (result && result._skipNext) return;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { createCircuitBreaker, circuitBreakerMiddleware, CircuitBreaker };
