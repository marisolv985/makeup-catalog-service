const alertRepository = require('../repositories/alertRepository');
const ApiError = require('../utils/ApiError');

class AlertService {
  async subscribe(usuarioId, productoSku, email) {
    const existing = await alertRepository.findByUserAndSku(usuarioId, productoSku);
    if (existing) {
      throw ApiError.conflict('Ya tienes una alerta activa para este producto');
    }

    return await alertRepository.create(usuarioId, productoSku, email);
  }

  async unsubscribe(usuarioId, productoSku) {
    const result = await alertRepository.deactivate(usuarioId, productoSku);
    if (result.count === 0) {
      throw ApiError.notFound('No se encontró una alerta activa para este producto');
    }
    return result;
  }

  async notifyBySku(productoSku) {
    return await alertRepository.findBySku(productoSku);
  }
}

module.exports = new AlertService();
