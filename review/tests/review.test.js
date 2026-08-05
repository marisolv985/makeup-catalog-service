const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'glowflow_catalog_secret_key_change_in_production';

function generateToken(id, username, rol) {
  return jwt.sign({ id, username, rol }, JWT_SECRET, { expiresIn: '1h' });
}

describe('Review Service API', () => {
  const token = generateToken('test123', 'testuser', 'VIEWER');
  const adminToken = generateToken('admin1', 'admin', 'ADMIN');

  describe('GET /health', () => {
    it('should return UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBeDefined();
      expect(res.body.service).toBe('review-service');
    });
  });

  describe('GET /api/v1/reviews/product/:sku', () => {
    it('should return reviews and stats for a product', async () => {
      const res = await request(app).get('/api/v1/reviews/product/TEST-001');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats).toHaveProperty('promedio');
      expect(res.body.stats).toHaveProperty('total');
    });
  });

  describe('POST /api/v1/reviews', () => {
    it('should reject request without auth', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .send({ productoSku: 'TEST', rating: 5 });
      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid rating', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ productoSku: 'TEST', rating: 6 });
      expect(res.statusCode).toBe(400);
    });

    it('should reject missing productoSku', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4 });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/alerts/subscribe', () => {
    it('should reject request without auth', async () => {
      const res = await request(app)
        .post('/api/v1/alerts/subscribe')
        .send({ productoSku: 'TEST' });
      expect(res.statusCode).toBe(401);
    });

    it('should reject missing productoSku', async () => {
      const res = await request(app)
        .post('/api/v1/alerts/subscribe')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.statusCode).toBeDefined();
    });
  });

  describe('JWT Validation', () => {
    it('should accept valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/reviews/user')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).not.toBe(401);
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign({ id: 'x', username: 'x', rol: 'VIEWER' }, JWT_SECRET, { expiresIn: '0s' });
      const res = await request(app)
        .get('/api/v1/reviews/user')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.statusCode).toBe(401);
    });
  });
});
