const { Router } = require('express');
const cosmeticsController = require('../controllers/cosmeticsController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');
const {
  createProductValidation,
  updateProductValidation,
  idParamValidation,
  skuParamValidation,
  decreaseStockValidation,
  increaseStockValidation,
  queryFiltersValidation,
} = require('../validators/cosmeticsValidator');
const validate = require('../middlewares/validate');

const router = Router();

/**
 * @swagger
 * /api/v1/cosmetics:
 *   get:
 *     tags: [Productos]
 *     summary: Obtener todos los productos
 *     description: Retorna productos con filtros, paginación y búsqueda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: marca
 *         schema: { type: string }
 *       - in: query
 *         name: categoria
 *         schema: { type: string, enum: [Labios, Rostro, Ojos, Brochas, Skincare, Accesorios] }
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [DISPONIBLE, AGOTADO, INACTIVO] }
 *       - in: query
 *         name: tipoPiel
 *         schema: { type: string }
 *       - in: query
 *         name: tono
 *         schema: { type: string }
 *       - in: query
 *         name: busqueda
 *         schema: { type: string }
 *       - in: query
 *         name: precioMin
 *         schema: { type: number }
 *       - in: query
 *         name: precioMax
 *         schema: { type: number }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Productos obtenidos exitosamente
 */
router.get(
  '/',
  authMiddleware,
  queryFiltersValidation,
  validate,
  cosmeticsController.getAll
);

/**
 * @swagger
 * /api/v1/cosmetics/sku/{sku}:
 *   get:
 *     tags: [Productos]
 *     summary: Obtener producto por SKU
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get(
  '/sku/:sku',
  authMiddleware,
  skuParamValidation,
  validate,
  cosmeticsController.getBySku
);

/**
 * @swagger
 * /api/v1/cosmetics/stock/{sku}:
 *   get:
 *     tags: [Inventario]
 *     summary: Consultar stock por SKU
 *     description: Endpoint consumido por orders-service. Tiene Circuit Breaker.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Stock consultado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockResponse'
 */
router.get(
  '/stock/:sku',
  authMiddleware,
  skuParamValidation,
  validate,
  cosmeticsController.getStock
);

/**
 * @swagger
 * /api/v1/cosmetics/exists/{sku}:
 *   get:
 *     tags: [Inventario]
 *     summary: Verificar existencia por SKU
 *     description: Endpoint consumido por orders-service. Tiene Circuit Breaker.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Resultado de verificación
 */
router.get(
  '/exists/:sku',
  authMiddleware,
  skuParamValidation,
  validate,
  cosmeticsController.exists
);

/**
 * @swagger
 * /api/v1/cosmetics/{id}:
 *   get:
 *     tags: [Productos]
 *     summary: Obtener producto por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  idParamValidation,
  validate,
  cosmeticsController.getById
);

/**
 * @swagger
 * /api/v1/cosmetics:
 *   post:
 *     tags: [Productos]
 *     summary: Crear producto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  createProductValidation,
  validate,
  cosmeticsController.create
);

/**
 * @swagger
 * /api/v1/cosmetics/{id}:
 *   put:
 *     tags: [Productos]
 *     summary: Actualizar producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: Producto no encontrado
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  updateProductValidation,
  validate,
  cosmeticsController.update
);

/**
 * @swagger
 * /api/v1/cosmetics/{id}:
 *   delete:
 *     tags: [Productos]
 *     summary: Eliminar producto (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  idParamValidation,
  validate,
  cosmeticsController.delete
);

/**
 * @swagger
 * /api/v1/cosmetics/stock/decrease:
 *   patch:
 *     tags: [Inventario]
 *     summary: Descontar stock
 *     description: Consumido por orders-service. Tiene Circuit Breaker.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DecreaseStockRequest'
 *     responses:
 *       200:
 *         description: Stock descontado
 *       400:
 *         description: Stock insuficiente
 */
router.patch(
  '/stock/decrease',
  authMiddleware,
  adminOnly,
  decreaseStockValidation,
  validate,
  cosmeticsController.decreaseStock
);

/**
 * @swagger
 * /api/v1/cosmetics/stock/increase:
 *   patch:
 *     tags: [Inventario]
 *     summary: Incrementar stock
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DecreaseStockRequest'
 *     responses:
 *       200:
 *         description: Stock incrementado
 */
router.patch(
  '/stock/increase',
  authMiddleware,
  adminOnly,
  increaseStockValidation,
  validate,
  cosmeticsController.increaseStock
);

module.exports = router;
