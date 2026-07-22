const axios = require('axios');
const { discoverService } = require('../config/discovery');
const { CATALOG_SERVICE_NAME } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'glowflow_catalog_secret_key_change_in_production';
const jwt = require('jsonwebtoken');

function generateInternalToken() {
  return jwt.sign(
    { id: 0, username: 'orders-service', rol: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '60s' }
  );
}

async function getCatalogUrl() {
  const discovered = await discoverService(CATALOG_SERVICE_NAME);
  if (discovered) return discovered;
  return process.env.CATALOG_FALLBACK_URL || 'http://makeup-catalog-service:3001';
}

async function checkStock(sku) {
  const baseUrl = await getCatalogUrl();
  const token = generateInternalToken();
  const response = await axios.get(`${baseUrl}/api/v1/cosmetics/stock/${sku}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
  return response.data;
}

async function decreaseStock(sku, cantidad) {
  const baseUrl = await getCatalogUrl();
  const token = generateInternalToken();
  const response = await axios.patch(
    `${baseUrl}/api/v1/cosmetics/stock/decrease`,
    { sku, cantidad },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    }
  );
  return response.data;
}

async function increaseStock(sku, cantidad) {
  const baseUrl = await getCatalogUrl();
  const token = generateInternalToken();
  const response = await axios.patch(
    `${baseUrl}/api/v1/cosmetics/stock/increase`,
    { sku, cantidad },
    {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    }
  );
  return response.data;
}

async function productExists(sku) {
  const baseUrl = await getCatalogUrl();
  const token = generateInternalToken();
  const response = await axios.get(`${baseUrl}/api/v1/cosmetics/exists/${sku}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 3000,
  });
  return response.data;
}

module.exports = { checkStock, decreaseStock, increaseStock, productExists };
