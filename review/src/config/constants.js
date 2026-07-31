module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'glowflow_catalog_secret_key_change_in_production',
  SERVICE_NAME: process.env.SERVICE_NAME || 'review-service',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  CATALOG_SERVICE_NAME: process.env.CATALOG_SERVICE_NAME || 'makeup-catalog-service',
  CATALOG_FALLBACK_URL: process.env.CATALOG_FALLBACK_URL || 'http://makeup-catalog-service:3001',
};
