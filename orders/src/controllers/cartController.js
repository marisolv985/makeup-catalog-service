const cartService = require('../services/cartService');

class CartController {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user.id);
      res.status(200).json({
        success: true,
        message: 'Carrito obtenido exitosamente',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const item = await cartService.addItem(
        req.user.id,
        req.body.productoSku,
        req.body.cantidad
      );
      res.status(201).json({
        success: true,
        message: 'Producto agregado al carrito',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItemQuantity(req, res, next) {
    try {
      const item = await cartService.updateItemQuantity(
        req.user.id,
        req.params.sku,
        req.body.cantidad
      );
      res.status(200).json({
        success: true,
        message: 'Cantidad actualizada',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      await cartService.removeItem(req.user.id, req.params.sku);
      res.status(200).json({
        success: true,
        message: 'Producto eliminado del carrito',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      await cartService.clearCart(req.user.id);
      res.status(200).json({
        success: true,
        message: 'Carrito vaciado',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
