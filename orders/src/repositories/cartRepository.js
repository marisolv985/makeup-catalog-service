const { prisma } = require('../config/database');

class CartRepository {
  async findOrCreateCart(usuarioId) {
    let cart = await prisma.cart.findUnique({
      where: { usuarioId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { usuarioId },
        include: { items: true },
      });
    }

    return cart;
  }

  async addItem(usuarioId, productoSku, cantidad, precioUnitario, nombreProducto, imagenUrl) {
    const cart = await this.findOrCreateCart(usuarioId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        carritoId_productoSku: {
          carritoId: cart.id,
          productoSku,
        },
      },
    });

    if (existingItem) {
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { cantidad: existingItem.cantidad + cantidad },
      });
    }

    return await prisma.cartItem.create({
      data: {
        carritoId: cart.id,
        productoSku,
        cantidad,
        precioUnitario,
        nombreProducto,
        imagenUrl,
      },
    });
  }

  async updateItemQuantity(usuarioId, productoSku, cantidad) {
    const cart = await this.findOrCreateCart(usuarioId);

    return await prisma.cartItem.update({
      where: {
        carritoId_productoSku: {
          carritoId: cart.id,
          productoSku,
        },
      },
      data: { cantidad },
    });
  }

  async removeItem(usuarioId, productoSku) {
    const cart = await this.findOrCreateCart(usuarioId);

    return await prisma.cartItem.delete({
      where: {
        carritoId_productoSku: {
          carritoId: cart.id,
          productoSku,
        },
      },
    });
  }

  async clearCart(usuarioId) {
    const cart = await prisma.cart.findUnique({
      where: { usuarioId },
    });

    if (!cart) return;

    await prisma.cartItem.deleteMany({
      where: { carritoId: cart.id },
    });

    return cart;
  }

  async getCart(usuarioId) {
    return await prisma.cart.findUnique({
      where: { usuarioId },
      include: { items: true },
    });
  }
}

module.exports = new CartRepository();
