const axios = require('axios');

const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://review-service:3004';

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

async function getReviews(sku) {
  try {
    const res = await axios.get(`${REVIEW_SERVICE_URL}/api/v1/reviews/product/${sku}`, { timeout: 5000 });
    var body = res.data;
    return {
      reviews: body.data || [],
      stats: body.stats || { promedio: 0, total: 0 }
    };
  } catch (err) {
    return { reviews: [], stats: { promedio: 0, total: 0 } };
  }
}

async function createReview(user, productoSku, rating, comment, imagenes) {
  const token = getToken(user);
  if (!token) throw new Error('No autenticado');
  const body = { productoSku, rating: parseInt(rating), username: user.username || '' };
  if (comment) body.comment = comment;
  if (imagenes && imagenes.length > 0) body.imagenes = imagenes;
  const res = await axios.post(`${REVIEW_SERVICE_URL}/api/v1/reviews`,
    body,
    { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
  );
  return res.data;
}

async function subscribeAlert(user, productoSku) {
  const token = getToken(user);
  if (!token) throw new Error('No autenticado');
  const res = await axios.post(`${REVIEW_SERVICE_URL}/api/v1/alerts/subscribe`,
    { productoSku },
    { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
  );
  return res.data;
}

module.exports = { getReviews, createReview, subscribeAlert };
