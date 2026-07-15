const Product = require('../models/Product');
const { createCircuitBreaker } = require('../utils/circuitBreaker');

async function findProductBySku(sku) {
  return await Product.findOne({ sku: sku.toUpperCase() });
}

async function getStockBySku(sku) {
  return await Product.findOne({ sku: sku.toUpperCase() }).select('sku stockDisponible titulo estado');
}

async function decreaseStock(sku, cantidad) {
  return await Product.findOneAndUpdate(
    { sku: sku.toUpperCase(), stockDisponible: { $gte: cantidad } },
    { $inc: { stockDisponible: -cantidad } },
    { new: true }
  );
}

async function productExists(sku) {
  const product = await Product.findOne({ sku: sku.toUpperCase() }).select('_id');
  return !!product;
}

const breakerFindProduct = createCircuitBreaker(findProductBySku, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 15000,
});

const breakerGetStock = createCircuitBreaker(getStockBySku, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 15000,
});

const breakerDecreaseStock = createCircuitBreaker(decreaseStock, {
  timeout: 5000,
  errorThresholdPercentage: 40,
  resetTimeout: 20000,
});

const breakerExists = createCircuitBreaker(productExists, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 15000,
});

breakerFindProduct.fallback(() => null);
breakerGetStock.fallback(() => null);
breakerDecreaseStock.fallback(() => null);
breakerExists.fallback(() => false);

module.exports = {
  breakerFindProduct,
  breakerGetStock,
  breakerDecreaseStock,
  breakerExists,
};
