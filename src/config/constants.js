module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'glowflow_catalog_secret_key_change_in_production',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3001',
};
