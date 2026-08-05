const axios = require('axios');

const CONSUL_URL = process.env.CONSUL_URL || 'http://localhost:8500';
const SERVICE_NAME = process.env.SERVICE_NAME || 'review-service';
const SERVICE_PORT = parseInt(process.env.PORT, 10) || 3004;

let registrationId = null;

async function registerWithConsul() {
  try {
    const serviceId = `${SERVICE_NAME}-${SERVICE_PORT}`;
    registrationId = serviceId;

    await axios.put(`${CONSUL_URL}/v1/agent/service/register`, {
      ID: serviceId,
      Name: SERVICE_NAME,
      Port: SERVICE_PORT,
      Tags: ['nodejs', 'express', 'reviews', 'alerts', 'glowflow'],
      Check: {
        HTTP: `http://localhost:${SERVICE_PORT}/health`,
        Interval: '10s',
        Timeout: '5s',
        DeregisterCriticalServiceAfter: '30s',
      },
      Meta: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    });

    console.log(`[ServiceDiscovery] Registrado en Consul: ${SERVICE_NAME} (puerto ${SERVICE_PORT})`);
  } catch (error) {
    console.warn(`[ServiceDiscovery] Consul no disponible, funcionando sin registro: ${error.message}`);
  }
}

async function deregisterFromConsul() {
  if (!registrationId) return;
  try {
    await axios.put(`${CONSUL_URL}/v1/agent/service/deregister/${registrationId}`);
    console.log(`[ServiceDiscovery] Deregistrado de Consul: ${registrationId}`);
  } catch (error) {
    console.warn(`[ServiceDiscovery] Error al deregistrar: ${error.message}`);
  }
}

async function discoverService(serviceName) {
  try {
    const response = await axios.get(`${CONSUL_URL}/v1/health/service/${serviceName}?passing=true`);
    if (response.data.length === 0) {
      throw new Error(`Servicio ${serviceName} no encontrado en Consul`);
    }
    const service = response.data[0];
    const address = service.Service.Address || 'localhost';
    const port = service.Service.Port;
    return `http://${address}:${port}`;
  } catch (error) {
    console.warn(`[ServiceDiscovery] Error descubriendo ${serviceName}: ${error.message}`);
    return null;
  }
}

module.exports = { registerWithConsul, deregisterFromConsul, discoverService };
