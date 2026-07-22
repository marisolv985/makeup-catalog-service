const { Router } = require('express');
const ordersClient = require('../../utils/ordersClient');
const { requireAuth, requireAdmin } = require('../../middlewares/authMiddleware');

const router = Router();

const buildOrderStats = (orders) => ({
  total: orders.length,
  pagadas: orders.filter(o => o.estado === 'PAGADO').length,
  enviadas: orders.filter(o => o.estado === 'ENVIADO').length,
  entregadas: orders.filter(o => o.estado === 'ENTREGADO').length,
  canceladas: orders.filter(o => o.estado === 'CANCELADO').length,
});

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
    const { direccionEnvio, notas, ciudad, codigoPostal, telefono, metodoPago } = req.body;
    const result = await ordersClient.checkout(req.user, direccionEnvio || null, notas || null, {
      ciudad: ciudad || null,
      codigoPostal: codigoPostal || null,
      telefono: telefono || null,
      metodoPago: metodoPago || null,
    });
    const order = result.data;
    res.redirect(`/orders/${order.id}?success=Compra confirmada. Guía: ${order.numeroGuia}`);
  } catch (error) {
    console.error('[Checkout Error]', error.response?.data || error.message);
    const msg = error.response?.data?.message || 'Error al procesar la orden';
    const errors = error.response?.data?.errors;
    const detail = errors ? errors.map(e => `${e.field}: ${e.message}`).join(', ') : '';
    res.redirect(`/cart?error=${encodeURIComponent(detail || msg)}`);
  }
});

router.get('/orders', requireAuth, async (req, res) => {
  try {
    const result = await ordersClient.getOrders(req.user, req.query);
    const orders = result.data || [];
    const pagination = result.pagination || { total: 0, page: 1, totalPages: 0 };
    const isAdmin = req.user && req.user.rol === 'ADMIN';
    const stats = isAdmin ? buildOrderStats(orders) : {};

    res.render('pages/orders', {
      title: isAdmin ? 'Todas las Órdenes' : 'Mis Órdenes',
      currentPath: '/orders',
      orders,
      pagination,
      stats,
      filters: req.query,
      successMessage: req.query.success || null,
      errorMessage: req.query.error || null,
    });
  } catch (error) {
    res.render('pages/orders', {
      title: 'Mis Órdenes',
      currentPath: '/orders',
      orders: [],
      pagination: { total: 0, page: 1, totalPages: 0 },
      stats: {},
      filters: {},
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

router.post('/admin/orders/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    await ordersClient.updateOrderStatus(req.user, req.params.id, estado);
    res.redirect(`/orders/${req.params.id}?success=Estado actualizado a ${estado}`);
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al actualizar estado';
    res.redirect(`/orders?error=${encodeURIComponent(msg)}`);
  }
});

module.exports = router;
