const orderRepository = require('../repositories/orderRepository');
const cartRepository = require('../repositories/cartRepository');
const { breakerCheckStock, breakerDecreaseStock } = require('../config/circuitBreakers');
const ApiError = require('../utils/ApiError');

class OrderService {
  async createOrderFromCart(usuarioId, direccionEnvio = null, notas = null, checkoutData = {}) {
    const cart = await cartRepository.getCart(usuarioId);
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('El carrito está vacío');
    }

    const items = [];
    let totalPagar = 0;

    for (const cartItem of cart.items) {
      const stockResult = await breakerCheckStock.fire(cartItem.productoSku);

      if (!stockResult || !stockResult.stockDisponible) {
        throw ApiError.badRequest(
          `No se pudo verificar el stock para ${cartItem.productoSku}. Intenta más tarde.`
        );
      }

      if (stockResult.stockDisponible < cartItem.cantidad) {
        throw ApiError.badRequest(
          `Stock insuficiente para ${cartItem.productoSku}. Disponible: ${stockResult.stockDisponible}, solicitado: ${cartItem.cantidad}`
        );
      }

      const subtotal = Number(cartItem.precioUnitario) * cartItem.cantidad;
      totalPagar += subtotal;

      items.push({
        productoSku: cartItem.productoSku,
        cantidad: cartItem.cantidad,
        precioUnitario: cartItem.precioUnitario,
        subtotal,
      });
    }

    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const numeroGuia = `GF-${timestamp}-${random}`;

    const order = await orderRepository.create(
      usuarioId,
      items,
      totalPagar,
      direccionEnvio,
      notas,
      {
        ciudad: checkoutData.ciudad,
        codigoPostal: checkoutData.codigoPostal,
        telefono: checkoutData.telefono,
        metodoPago: checkoutData.metodoPago,
        numeroGuia,
        estado: 'PAGADO',
      }
    );

    for (const item of items) {
      await breakerDecreaseStock.fire(item.productoSku, item.cantidad);
    }

    await cartRepository.clearCart(usuarioId);

    return order;
  }

  async createDirectOrder(usuarioId, productoSku, cantidad, direccionEnvio = null, notas = null) {
    const stockResult = await breakerCheckStock.fire(productoSku);

    if (!stockResult || !stockResult.stockDisponible) {
      throw ApiError.badRequest(
        `No se pudo verificar el stock para ${productoSku}. Intenta más tarde.`
      );
    }

    if (stockResult.stockDisponible < cantidad) {
      throw ApiError.badRequest(
        `Stock insuficiente para ${productoSku}. Disponible: ${stockResult.stockDisponible}, solicitado: ${cantidad}`
      );
    }

    const precioUnitario = stockResult.precio || 0;
    const subtotal = precioUnitario * cantidad;
    const items = [{
      productoSku,
      cantidad,
      precioUnitario,
      subtotal,
    }];

    const order = await orderRepository.create(
      usuarioId,
      items,
      subtotal,
      direccionEnvio,
      notas
    );

    await breakerDecreaseStock.fire(productoSku, cantidad);

    return order;
  }

  async getOrders(usuarioId, rol, query) {
    const { estado, page = 1, limit = 20 } = query;

    const filters = {};
    if (rol !== 'ADMIN') {
      filters.usuarioId = usuarioId;
    }
    if (estado) {
      filters.estado = estado;
    }

    return await orderRepository.findAll(filters, parseInt(page, 10), parseInt(limit, 10));
  }

  async getOrderById(id, usuarioId, rol) {
    const order = await orderRepository.findById(parseInt(id, 10));
    if (!order) {
      throw ApiError.notFound('Orden no encontrada');
    }

    if (rol !== 'ADMIN' && order.usuarioId !== usuarioId) {
      throw ApiError.forbidden('No tienes acceso a esta orden');
    }

    return order;
  }

  async updateOrderStatus(id, estado) {
    const order = await orderRepository.findById(parseInt(id, 10));
    if (!order) {
      throw ApiError.notFound('Orden no encontrada');
    }

    const validTransitions = {
      PENDIENTE_PAGO: ['PAGADO', 'CANCELADO'],
      PAGADO: ['ENVIADO', 'CANCELADO'],
      ENVIADO: ['ENTREGADO'],
      ENTREGADO: [],
      CANCELADO: [],
    };

    if (!validTransitions[order.estado].includes(estado)) {
      throw ApiError.badRequest(
        `No se puede cambiar de ${order.estado} a ${estado}`
      );
    }

    if (estado === 'CANCELADO' && order.estado !== 'PENDIENTE_PAGO') {
      for (const item of order.items) {
        await breakerDecreaseStock.fire(item.productoSku, item.cantidad);
      }
    }

    return await orderRepository.updateStatus(parseInt(id, 10), estado);
  }

  async getDashboardStats() {
    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenue,
    ] = await Promise.all([
      orderRepository.countAll(),
      orderRepository.countByEstado('PENDIENTE_PAGO'),
      orderRepository.countByEstado('PAGADO'),
      orderRepository.countByEstado('ENVIADO'),
      orderRepository.countByEstado('ENTREGADO'),
      orderRepository.countByEstado('CANCELADO'),
      orderRepository.getRevenue(),
    ]);

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenue: Number(revenue),
    };
  }
}

module.exports = new OrderService();
