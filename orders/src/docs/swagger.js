const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GlowFlow Orders API',
      version: '1.0.0',
      description: 'API del microservicio de órdenes y pedidos de GlowFlow',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Orders Service (desarrollo)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Formato: Bearer <token>',
        },
      },
    },
    tags: [
      { name: 'Órdenes', description: 'Gestión de órdenes de compra' },
      { name: 'Carrito', description: 'Gestión del carrito de compras' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
