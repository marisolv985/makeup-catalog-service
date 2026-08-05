const axios = require('axios');
const { discoverService } = require('../config/discovery');
const { CATALOG_SERVICE_NAME, CATALOG_FALLBACK_URL } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'glowflow_catalog_secret_key_change_in_production';
const jwt = require('jsonwebtoken');

function generateInternalToken() {
  return jwt.sign(
    { id: 0, username: 'review-service', rol: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '60s' }
  );
}

async function getCatalogUrl() {
  const discovered = await discoverService(CATALOG_SERVICE_NAME);
  if (discovered) return discovered;
  return CATALOG_FALLBACK_URL;
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

module.exports = { productExists };
