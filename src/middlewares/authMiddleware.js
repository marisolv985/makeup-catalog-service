const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

const authMiddleware = (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.gf_token) {
    token = req.cookies.gf_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación no proporcionado',
      errors: [],
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      rol: decoded.rol,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      errors: [],
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.rol !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador',
      errors: [],
    });
  }
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  if (req.user.rol !== 'ADMIN') {
    return res.redirect('/products?error=Acceso denegado. Se requiere rol de administrador');
  }
  next();
};

const requireEditorOrAbove = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  if (!['ADMIN', 'EDITOR'].includes(req.user.rol)) {
    return res.redirect('/products?error=Acceso denegado. Se requiere rol de editor o administrador');
  }
  next();
};

module.exports = { authMiddleware, adminOnly, requireAuth, requireAdmin, requireEditorOrAbove };
