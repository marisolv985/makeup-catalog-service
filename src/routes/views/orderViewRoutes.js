const { Router } = require('express');
const ordersClient = require('../../utils/ordersClient');
const { requireAuth } = require('../../middlewares/authMiddleware');

const router = Router();

router.get('/cart', requireAuth, async (req, res) => {
  try {
    const cart = await ordersClient.getCart(req.user);
    res.render('pages/cart', {
      title: 'Mi Carrito',
      currentPath: '/cart',
      cart,
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.render('pages/cart', {
      title: 'Mi Carrito',
      currentPath: '/cart',
      cart: { items: [], total: 0 },
      errorMessage: 'Error al cargar el carrito',
    });
  }
});

router.post('/cart/add', requireAuth, async (req, res) => {
  try {
    const { productoSku, cantidad = 1 } = req.body;
    await ordersClient.addToCart(req.user, productoSku, parseInt(cantidad, 10));
    res.redirect('/cart?success=Producto agregado al carrito');
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al agregar al carrito';
    res.redirect(`/products?error=${encodeURIComponent(msg)}`);
  }
});

router.post('/cart/update', requireAuth, async (req, res) => {
  try {
    const { sku, cantidad } = req.body;
    await ordersClient.updateCartItem(req.user, sku, parseInt(cantidad, 10));
    res.redirect('/cart');
  } catch (error) {
    res.redirect('/cart?error=Error al actualizar cantidad');
  }
});

router.post('/cart/remove', requireAuth, async (req, res) => {
  try {
    const { sku } = req.body;
    await ordersClient.removeFromCart(req.user, sku);
    res.redirect('/cart?success=Producto eliminado del carrito');
  } catch (error) {
    res.redirect('/cart?error=Error al eliminar producto');
  }
});

router.post('/cart/checkout', requireAuth, async (req, res) => {
  try {
    const { direccionEnvio, notas } = req.body;
    await ordersClient.checkout(req.user, direccionEnvio || null, notas || null);
    res.redirect('/orders?success=Orden creada exitosamente');
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al procesar la orden';
    res.redirect(`/cart?error=${encodeURIComponent(msg)}`);
  }
});

router.get('/orders', requireAuth, async (req, res) => {
  try {
    const result = await ordersClient.getOrders(req.user, req.query);
    res.render('pages/orders', {
      title: 'Mis Órdenes',
      currentPath: '/orders',
      orders: result.data || [],
      pagination: result.pagination || { total: 0, page: 1, totalPages: 0 },
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.render('pages/orders', {
      title: 'Mis Órdenes',
      currentPath: '/orders',
      orders: [],
      pagination: { total: 0, page: 1, totalPages: 0 },
      errorMessage: 'Error al cargar las órdenes',
    });
  }
});

router.get('/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = await ordersClient.getOrderById(req.user, req.params.id);
    if (!order) {
      return res.redirect('/orders?error=Orden no encontrada');
    }
    res.render('pages/orderDetail', {
      title: `Orden #${order.id}`,
      currentPath: '/orders',
      order,
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.redirect('/orders?error=Error al cargar la orden');
  }
});

module.exports = router;
