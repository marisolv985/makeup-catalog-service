const catalogClient = require('../utils/catalogClient');
const { createCircuitBreaker } = require('../utils/circuitBreaker');

async function checkStock(sku) {
  return await catalogClient.checkStock(sku);
}

async function decreaseStock(sku, cantidad) {
  return await catalogClient.decreaseStock(sku, cantidad);
}

async function productExists(sku) {
  return await catalogClient.productExists(sku);
}

const breakerCheckStock = createCircuitBreaker(checkStock, {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 20000,
});

const breakerDecreaseStock = createCircuitBreaker(decreaseStock, {
  timeout: 8000,
  errorThresholdPercentage: 40,
  resetTimeout: 30000,
});

const breakerProductExists = createCircuitBreaker(productExists, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 15000,
});

breakerCheckStock.fallback(() => ({ available: false, message: 'Catálogo no disponible' }));
breakerDecreaseStock.fallback(() => ({ success: false, message: 'Catálogo no disponible' }));
breakerProductExists.fallback(() => ({ exists: false }));

module.exports = {
  breakerCheckStock,
  breakerDecreaseStock,
  breakerProductExists,
};
