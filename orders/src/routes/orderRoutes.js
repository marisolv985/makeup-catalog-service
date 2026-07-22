const { Router } = require('express');
const orderController = require('../controllers/orderController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');
const {
  createDirectOrderValidation,
  createFromCartValidation,
  updateStatusValidation,
  idParamValidation,
  queryFiltersValidation,
} = require('../validators/orderValidator');
const validate = require('../middlewares/validate');

const router = Router();

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     tags: [Órdenes]
 *     summary: Obtener todas las órdenes
 *     description: Admin ve todas, cliente solo las suyas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [PENDIENTE_PAGO, PAGADO, ENVIADO, ENTREGADO, CANCELADO] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Órdenes obtenidas exitosamente
 */
router.get(
  '/',
  authMiddleware,
  queryFiltersValidation,
  validate,
  orderController.getAll
);

/**
 * @swagger
 * /api/v1/orders/stats:
 *   get:
 *     tags: [Órdenes]
 *     summary: Estadísticas de órdenes (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas
 */
router.get('/stats', authMiddleware, adminOnly, orderController.getStats);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     tags: [Órdenes]
 *     summary: Obtener orden por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Orden encontrada
 *       404:
 *         description: Orden no encontrada
 */
router.get(
  '/:id',
  authMiddleware,
  idParamValidation,
  validate,
  orderController.getById
);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     tags: [Órdenes]
 *     summary: Crear orden directa
 *     description: Crea una orden con un solo producto sin pasar por el carrito
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productoSku, cantidad]
 *             properties:
 *               productoSku:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *               direccionEnvio:
 *                 type: string
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Orden creada
 */
router.post(
  '/',
  authMiddleware,
  createDirectOrderValidation,
  validate,
  orderController.createDirect
);

/**
 * @swagger
 * /api/v1/orders/checkout:
 *   post:
 *     tags: [Órdenes]
 *     summary: Crear orden desde carrito
 *     description: Convierte el carrito actual en una orden
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               direccionEnvio:
 *                 type: string
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Orden creada desde carrito
 */
router.post(
  '/checkout',
  authMiddleware,
  createFromCartValidation,
  validate,
  orderController.createFromCart
);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     tags: [Órdenes]
 *     summary: Actualizar estado de orden (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [PENDIENTE_PAGO, PAGADO, ENVIADO, ENTREGADO, CANCELADO]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch(
  '/:id/status',
  authMiddleware,
  adminOnly,
  updateStatusValidation,
  validate,
  orderController.updateStatus
);

module.exports = router;
