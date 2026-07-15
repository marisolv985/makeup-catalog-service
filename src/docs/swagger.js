const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GlowFlow - Makeup Catalog Service API',
      version: '1.0.0',
      description: `API del microservicio de catálogo de productos cosméticos para la plataforma GlowFlow.

## Patrones Implementados
- **Circuit Breaker (Opossum)**: Los endpoints de stock y existencia tienen protección contra fallos en cascada. Si MongoDB falla, el servicio responde con degradación graceful.
- **Service Discovery (Consul)**: El servicio se registra automáticamente al encenderse para que otros microservicios lo encuentren.
- **JWT Validation**: Valida tokens generados por el API Gateway. Los endpoints de stock requieren rol ADMIN.

## Consumo por otros microservicios
El \`orders-service\` puede consultar stock y existencia usando estos endpoints internos:
- \`GET /api/v1/cosmetics/stock/:sku\` → Consultar stock
- \`GET /api/v1/cosmetics/exists/:sku\` → Verificar existencia
- \`PATCH /api/v1/cosmetics/stock/decrease\` → Descontar stock`,
      contact: {
        name: 'GlowFlow Team',
        email: 'dev@glowflow.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT generado por el API Gateway / user-service',
        },
      },
      schemas: {
        ProductCreate: {
          type: 'object',
          required: ['sku', 'titulo', 'descripcion', 'marca', 'categoria', 'precio', 'stockDisponible'],
          properties: {
            sku: { type: 'string', example: 'COSM-LIP-RED-01', description: 'SKU único del producto' },
            titulo: { type: 'string', example: 'Matte Liquid Lipstick', description: 'Título del producto (mín. 3 caracteres)' },
            descripcion: { type: 'string', example: 'Labial de larga duración con acabado mate intenso', description: 'Descripción (mín. 20 caracteres)' },
            marca: { type: 'string', example: 'GlowBeauty', description: 'Marca del producto' },
            categoria: { type: 'string', enum: ['Labios', 'Rostro', 'Ojos', 'Brochas', 'Skincare', 'Accesorios'], description: 'Categoría' },
            precio: { type: 'number', example: 299.00, description: 'Precio (debe ser mayor a 0)' },
            stockDisponible: { type: 'integer', example: 15, description: 'Stock disponible (>= 0)' },
            tipoPielRecomendado: { type: 'array', items: { type: 'string', enum: ['Seca', 'Grasa', 'Mixta', 'Normal', 'Todos'] } },
            tono: { type: 'string', example: 'Rojo Carmesí' },
            ingredientes: { type: 'array', items: { type: 'string' } },
            peso: { type: 'string', example: '30ml' },
            imagenes: { type: 'array', items: { type: 'string' } },
            estado: { type: 'string', enum: ['DISPONIBLE', 'AGOTADO', 'INACTIVO'], default: 'DISPONIBLE' },
          },
        },
        ProductResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65b2d7f8c9e4a321a0f5e123' },
            sku: { type: 'string', example: 'COSM-LIP-RED-01' },
            titulo: { type: 'string', example: 'Matte Liquid Lipstick' },
            marca: { type: 'string', example: 'GlowBeauty' },
            categoria: { type: 'string', example: 'Labios' },
            precio: { type: 'number', example: 299.00 },
            stockDisponible: { type: 'integer', example: 15 },
            status: { type: 'string', enum: ['DISPONIBLE', 'AGOTADO', 'INACTIVO'], example: 'DISPONIBLE' },
          },
        },
        StockResponse: {
          type: 'object',
          properties: {
            sku: { type: 'string', example: 'COSM-LIP-RED-001' },
            stockDisponible: { type: 'integer', example: 15 },
          },
        },
        ExistsResponse: {
          type: 'object',
          properties: {
            exists: { type: 'boolean', example: true },
          },
        },
        DecreaseStockRequest: {
          type: 'object',
          required: ['sku', 'cantidad'],
          properties: {
            sku: { type: 'string', example: 'COSM-LIP-RED-001' },
            cantidad: { type: 'integer', example: 2, minimum: 1 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error al procesar la solicitud' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
        CircuitBreakerResponse: {
          type: 'object',
          description: 'Respuesta cuando el Circuit Breaker está abierto (servicio en mantenimiento)',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Catálogo en mantenimiento temporal. Intenta más tarde.' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
