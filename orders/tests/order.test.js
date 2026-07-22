const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'glowflow_catalog_secret_key_change_in_production';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

function generateAdminToken() {
  return generateToken({ id: '000000000000000000000001', username: 'admin', rol: 'ADMIN' });
}

function generateClientToken() {
  return generateToken({ id: '507f1f77bcf86cd799439011', username: 'clienta1', rol: 'VIEWER' });
}

describe('Orders Service', () => {
  describe('JWT Token Generation', () => {
    test('should generate a valid admin token', () => {
      const token = generateAdminToken();
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.rol).toBe('ADMIN');
      expect(decoded.username).toBe('admin');
    });

    test('should generate a valid client token', () => {
      const token = generateClientToken();
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.rol).toBe('VIEWER');
      expect(decoded.username).toBe('clienta1');
    });

    test('should decode token payload correctly', () => {
      const token = generateToken({ id: '507f1f77bcf86cd799439011', username: 'test', rol: 'ADMIN' });
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe('507f1f77bcf86cd799439011');
      expect(decoded.username).toBe('test');
    });

    test('should fail with wrong secret', () => {
      const token = generateAdminToken();
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });
  });
});
