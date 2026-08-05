const alertService = require('../services/alertService');

class AlertController {
  async subscribe(req, res, next) {
    try {
      const alert = await alertService.subscribe(
        req.user.id,
        req.body.productoSku,
        req.body.email
      );
      res.status(201).json({
        success: true,
        message: 'Alerta de restock activada exitosamente',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  async unsubscribe(req, res, next) {
    try {
      await alertService.unsubscribe(req.user.id, req.params.sku);
      res.status(200).json({
        success: true,
        message: 'Alerta de restock desactivada exitosamente',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkAlerts(req, res, next) {
    try {
      const alerts = await alertService.notifyBySku(req.params.sku);
      res.status(200).json({
        success: true,
        message: 'Alertas activas obtenidas exitosamente',
        data: alerts,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertController();
