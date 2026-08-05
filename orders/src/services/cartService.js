const cartRepository = require('../repositories/cartRepository');
const { breakerCheckStock, breakerProductExists } = require('../config/circuitBreakers');
const ApiError = require('../utils/ApiError');

class CartService {
  async getCart(usuarioId) {
    const cart = await cartRepository.getCart(usuarioId);
    if (!cart) {
      return { items: [], total: 0 };
    }

    let total = 0;
    for (const item of cart.items) {
      total += Number(item.precioUnitario) * item.cantidad;
    }

    return { ...cart, total };
  }

  async addItem(usuarioId, productoSku, cantidad) {
    const existsResult = await breakerProductExists.fire(productoSku);
    if (!existsResult || !existsResult.exists) {
      throw ApiError.notFound(`Producto con SKU ${productoSku} no encontrado en el catálogo`);
    }

    const stockResult = await breakerCheckStock.fire(productoSku);
    if (!stockResult || !stockResult.stockDisponible) {
      throw ApiError.badRequest(
        `No se pudo verificar el stock para ${productoSku}. Intenta más tarde.`
      );
    }

    if (stockResult.stockDisponible < cantidad) {
      throw ApiError.badRequest(
        `Stock insuficiente para ${productoSku}. Disponible: ${stockResult.stockDisponible}`
      );
    }

    const precioUnitario = stockResult.precio || 0;
    const nombreProducto = stockResult.titulo || productoSku;
    const imagenUrl = stockResult.imagenUrl || null;

    return await cartRepository.addItem(
      usuarioId,
      productoSku,
      cantidad,
      precioUnitario,
      nombreProducto,
      imagenUrl
    );
  }

  async updateItemQuantity(usuarioId, productoSku, cantidad) {
    const stockResult = await breakerCheckStock.fire(productoSku);
    if (stockResult && stockResult.stockDisponible && stockResult.stockDisponible < cantidad) {
      throw ApiError.badRequest(
        `Stock insuficiente para ${productoSku}. Disponible: ${stockResult.stockDisponible}`
      );
    }

    return await cartRepository.updateItemQuantity(usuarioId, productoSku, cantidad);
  }

  async removeItem(usuarioId, productoSku) {
    return await cartRepository.removeItem(usuarioId, productoSku);
  }

  async clearCart(usuarioId) {
    return await cartRepository.clearCart(usuarioId);
  }
}

module.exports = new CartService();
