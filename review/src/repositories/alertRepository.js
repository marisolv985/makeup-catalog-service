const { prisma } = require('../config/database');

class AlertRepository {
  async create(usuarioId, productoSku, email) {
    return await prisma.restockAlert.create({
      data: {
        usuarioId,
        productoSku,
        email,
      },
    });
  }

  async findByUserAndSku(usuarioId, productoSku) {
    return await prisma.restockAlert.findFirst({
      where: { usuarioId, productoSku, activo: true },
    });
  }

  async deactivate(usuarioId, productoSku) {
    return await prisma.restockAlert.updateMany({
      where: { usuarioId, productoSku, activo: true },
      data: { activo: false },
    });
  }

  async findBySku(productoSku) {
    return await prisma.restockAlert.findMany({
      where: { productoSku, activo: true },
    });
  }
}

module.exports = new AlertRepository();
