const { Router } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const { JWT_SECRET } = require('../config/constants');

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function setAuthCookie(res, token) {
  res.cookie('gf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  });
}

router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('pages/login', {
    title: 'Iniciar Sesión',
    currentPath: '/login',
    errorMessage: null,
  });
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('pages/login', {
        title: 'Iniciar Sesión',
        currentPath: '/login',
        errorMessage: 'Usuario y contraseña son obligatorios',
      });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      activo: true,
    });

    if (!user) {
      return res.render('pages/login', {
        title: 'Iniciar Sesión',
        currentPath: '/login',
        errorMessage: 'Credenciales inválidas',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('pages/login', {
        title: 'Iniciar Sesión',
        currentPath: '/login',
        errorMessage: 'Credenciales inválidas',
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.redirect('/');
  } catch (error) {
    res.render('pages/login', {
      title: 'Iniciar Sesión',
      currentPath: '/login',
      errorMessage: 'Error al iniciar sesión',
    });
  }
});

router.get('/register', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('pages/register', {
    title: 'Crear Cuenta',
    currentPath: '/register',
    errorMessage: null,
    formData: {},
  });
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password, confirmPassword, nombre } = req.body;

    if (!username || !email || !password) {
      return res.render('pages/register', {
        title: 'Crear Cuenta',
        currentPath: '/register',
        errorMessage: 'Todos los campos son obligatorios',
        formData: req.body,
      });
    }

    if (password !== confirmPassword) {
      return res.render('pages/register', {
        title: 'Crear Cuenta',
        currentPath: '/register',
        errorMessage: 'Las contraseñas no coinciden',
        formData: req.body,
      });
    }

    if (password.length < 6) {
      return res.render('pages/register', {
        title: 'Crear Cuenta',
        currentPath: '/register',
        errorMessage: 'La contraseña debe tener al menos 6 caracteres',
        formData: req.body,
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const field = existingUser.username === username ? 'usuario' : 'email';
      return res.render('pages/register', {
        title: 'Crear Cuenta',
        currentPath: '/register',
        errorMessage: `El ${field} ya está en uso`,
        formData: req.body,
      });
    }

    const user = new User({
      username,
      email,
      password,
      nombre: nombre || '',
    });

    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.redirect('/?success=Cuenta creada exitosamente');
  } catch (error) {
    res.render('pages/register', {
      title: 'Crear Cuenta',
      currentPath: '/register',
      errorMessage: error.message || 'Error al crear la cuenta',
      formData: req.body,
    });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('gf_token');
  res.redirect('/login');
});

module.exports = router;