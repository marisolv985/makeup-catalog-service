const { prisma } = require('../config/database');

class ReviewRepository {
  async create(usuarioId, productoSku, rating, comment = null, imagenes = [], username = '') {
    return await prisma.review.create({
      data: {
        usuarioId,
        username,
        productoSku,
        rating,
        comment,
        imagenes,
      },
    });
  }

  async findBySku(productoSku) {
    return await prisma.review.findMany({
      where: { productoSku },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async findByUser(usuarioId) {
    return await prisma.review.findMany({
      where: { usuarioId },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async stats(productoSku) {
    const result = await prisma.review.aggregate({
      where: { productoSku },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      promedio: result._avg.rating ? Math.round(result._avg.rating * 100) / 100 : 0,
      total: result._count.rating,
    };
  }
}

module.exports = new ReviewRepository();
