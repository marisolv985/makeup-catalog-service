const axios = require('axios');

const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL || 'http://orders-service:3002';

function getToken(user) {
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../config/constants');
  if (!user) return null;
  return jwt.sign(
    { id: user.id, username: user.username, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '5m' }
  );
}

async function getCart(user) {
  const token = getToken(user);
  if (!token) return { items: [], total: 0 };
  try {
    const res = await axios.get(`${ORDERS_SERVICE_URL}/api/v1/cart`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    return res.data.data;
  } catch (err) {
    console.warn('[OrdersClient] Error getting cart:', err.message);
    return { items: [], total: 0 };
  }
}

async function addToCart(user, productoSku, cantidad) {
  const token = getToken(user);
  if (!token) throw new Error('No autenticado');
  const res = await axios.post(`${ORDERS_SERVICE_URL}/api/v1/cart/items`,
    { productoSku, cantidad },
    { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
  );
  return res.data;
}

async function updateCartItem(user, sku, cantidad) {
  const token = getToken(user);
  if (!token) throw new Error('No autenticado');
  const res = await axios.put(`${ORDERS_SERVICE_URL}/api/v1/cart/items/${sku}`,
    { cantidad },
    { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
  );
  return res.data;
}

async function removeFromCart(user, sku) {
  const token = getToken(user);
  if (!token) throw new Error('No autenticado');
  const res = await axios.delete(`${ORDERS_SERVICE_URL}/api/v1/cart/items/${sku}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000,
  });
  return res.data;
}

async function checkout(user, direccionEnvio, notas, checkoutData = {}) {
  const token = getToken(user);
  if (!token) throw new Error('No autenticado');
  const body = {};
  if (direccionEnvio) body.direccionEnvio = direccionEnvio;
  if (notas) body.notas = notas;
  if (checkoutData.ciudad) body.ciudad = checkoutData.ciudad;
  if (checkoutData.codigoPostal) body.codigoPostal = checkoutData.codigoPostal;
  if (checkoutData.telefono) body.telefono = checkoutData.telefono;
  if (checkoutData.metodoPago) body.metodoPago = checkoutData.metodoPago;
  const res = await axios.post(`${ORDERS_SERVICE_URL}/api/v1/orders/checkout`,
    body,
    { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
  );
  return res.data;
}

async function getOrders(user, query = {}) {
  const token = getToken(user);
  if (!token) return { data: [], pagination: { total: 0 } };
  try {
    const params = new URLSearchParams();
    if (query.estado) params.set('estado', query.estado);
    if (query.page) params.set('page', query.page);
    const res = await axios.get(`${ORDERS_SERVICE_URL}/api/v1/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    return res.data;
  } catch (err) {
    console.warn('[OrdersClient] Error getting orders:', err.message);
    return { data: [], pagination: { total: 0 } };
  }
}

async function getOrderById(user, id) {
  const token = getToken(user);
  if (!token) return null;
  try {
    const res = await axios.get(`${ORDERS_SERVICE_URL}/api/v1/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    return res.data.data;
  } catch (err) {
    console.warn('[OrdersClient] Error getting order:', err.message);
    return null;
  }
}

async function updateOrderStatus(user, orderId, estado) {
  const token = getToken(user);
  if (!token) throw new Error('No autenticado');
  const res = await axios.patch(`${ORDERS_SERVICE_URL}/api/v1/orders/${orderId}/status`,
    { estado },
    { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
  );
  return res.data;
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  checkout,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
