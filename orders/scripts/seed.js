const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando datos existentes...');
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  console.log('Creando carrito de prueba...');
  const cart = await prisma.cart.create({
    data: {
      usuarioId: '507f1f77bcf86cd799439011',
      items: {
        create: [
          {
            productoSku: 'COSM-LIP-RED-01',
            cantidad: 2,
            precioUnitario: 299.00,
            nombreProducto: 'Matte Liquid Lipstick',
          },
          {
            productoSku: 'COSM-ROS-LIQ-01',
            cantidad: 1,
            precioUnitario: 450.00,
            nombreProducto: 'Base Líquida Glow',
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log(`Carrito creado para usuarioId ${cart.usuarioId} con ${cart.items.length} items`);

  console.log('Creando orden de prueba...');
  const order = await prisma.order.create({
    data: {
      usuarioId: '507f1f77bcf86cd799439011',
      estado: 'PENDIENTE_PAGO',
      totalPagar: 1049.00,
      direccionEnvio: 'Calle Flores 123, Colonia Roma, CDMX',
      notas: 'Entregar en la tarde por favor',
      items: {
        create: [
          {
            productoSku: 'COSM-LIP-RED-01',
            cantidad: 2,
            precioUnitario: 299.00,
            subtotal: 598.00,
          },
          {
            productoSku: 'COSM-ROS-LIQ-01',
            cantidad: 1,
            precioUnitario: 451.00,
            subtotal: 451.00,
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log(`Orden #${order.id} creada con ${order.items.length} items`);

  console.log('Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
