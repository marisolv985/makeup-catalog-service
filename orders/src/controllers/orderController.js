const orderService = require('../services/orderService');

class OrderController {
  async createFromCart(req, res, next) {
    try {
      const order = await orderService.createOrderFromCart(
        req.user.id,
        req.body.direccionEnvio,
        req.body.notas,
        {
          ciudad: req.body.ciudad,
          codigoPostal: req.body.codigoPostal,
          telefono: req.body.telefono,
          metodoPago: req.body.metodoPago,
        }
      );
      res.status(201).json({
        success: true,
        message: 'Orden creada exitosamente desde el carrito',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async createDirect(req, res, next) {
    try {
      const order = await orderService.createDirectOrder(
        req.user.id,
        req.body.productoSku,
        req.body.cantidad,
        req.body.direccionEnvio,
        req.body.notas
      );
      res.status(201).json({
        success: true,
        message: 'Orden creada exitosamente',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await orderService.getOrders(req.user.id, req.user.rol, req.query);
      res.status(200).json({
        success: true,
        message: 'Órdenes obtenidas exitosamente',
        data: result.results,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.rol);
      res.status(200).json({
        success: true,
        message: 'Orden obtenida exitosamente',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body.estado);
      res.status(200).json({
        success: true,
        message: 'Estado de orden actualizado exitosamente',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await orderService.getDashboardStats();
      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
