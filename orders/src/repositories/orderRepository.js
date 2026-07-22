const { prisma } = require('../config/database');

class OrderRepository {
  async create(usuarioId, items, totalPagar, direccionEnvio = null, notas = null, extra = {}) {
    return await prisma.order.create({
      data: {
        usuarioId,
        totalPagar,
        direccionEnvio,
        notas,
        ciudad: extra.ciudad || null,
        codigoPostal: extra.codigoPostal || null,
        telefono: extra.telefono || null,
        metodoPago: extra.metodoPago || null,
        numeroGuia: extra.numeroGuia || null,
        estado: extra.estado || 'PENDIENTE_PAGO',
        items: {
          create: items.map((item) => ({
            productoSku: item.productoSku,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAll(filters = {}, page = 1, limit = 20) {
    const where = {};
    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.estado) where.estado = filters.estado;

    const [results, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { fechaCreacion: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { results, total, page, limit };
  }

  async findById(id) {
    return await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async updateStatus(id, estado) {
    return await prisma.order.update({
      where: { id },
      data: { estado },
      include: { items: true },
    });
  }

  async countByEstado(estado) {
    return await prisma.order.count({ where: { estado } });
  }

  async countAll() {
    return await prisma.order.count();
  }

  async getRevenue() {
    const result = await prisma.order.aggregate({
      _sum: { totalPagar: true },
      where: { estado: { in: ['PAGADO', 'ENVIADO', 'ENTREGADO'] } },
    });
    return result._sum.totalPagar || 0;
  }
}

module.exports = new OrderRepository();
