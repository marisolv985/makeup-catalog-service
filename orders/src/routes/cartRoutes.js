const { Router } = require('express');
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  addItemValidation,
  updateQuantityValidation,
  removeItemValidation,
} = require('../validators/cartValidator');
const validate = require('../middlewares/validate');

const router = Router();

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     tags: [Carrito]
 *     summary: Obtener carrito del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito obtenido
 */
router.get('/', authMiddleware, cartController.getCart);

/**
 * @swagger
 * /api/v1/cart/items:
 *   post:
 *     tags: [Carrito]
 *     summary: Agregar producto al carrito
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
 *     responses:
 *       201:
 *         description: Producto agregado
 */
router.post(
  '/items',
  authMiddleware,
  addItemValidation,
  validate,
  cartController.addItem
);

/**
 * @swagger
 * /api/v1/cart/items/{sku}:
 *   put:
 *     tags: [Carrito]
 *     summary: Actualizar cantidad de producto en carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cantidad]
 *             properties:
 *               cantidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 */
router.put(
  '/items/:sku',
  authMiddleware,
  updateQuantityValidation,
  validate,
  cartController.updateItemQuantity
);

/**
 * @swagger
 * /api/v1/cart/items/{sku}:
 *   delete:
 *     tags: [Carrito]
 *     summary: Quitar producto del carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto eliminado
 */
router.delete(
  '/items/:sku',
  authMiddleware,
  removeItemValidation,
  validate,
  cartController.removeItem
);

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     tags: [Carrito]
 *     summary: Vaciar carrito
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado
 */
router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router;
