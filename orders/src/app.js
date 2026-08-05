const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const { JWT_SECRET, CORS_ORIGIN } = require('./config/constants');
const jwt = require('jsonwebtoken');
const { prisma } = require('./config/database');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('combined'));
app.use(requestLogger);
app.use(cookieParser());

app.use((req, res, next) => {
  req.user = null;
  const token = req.cookies && req.cookies.gf_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id,
        username: decoded.username,
        rol: decoded.rol,
      };
    } catch (err) {
      res.clearCookie('gf_token');
    }
  }
  res.locals.user = req.user;
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GlowFlow Orders API Docs',
}));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    var dbStatus = 'UP';
  } catch {
    var dbStatus = 'DOWN';
  }

  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: dbStatus === 'UP' ? 'UP' : 'DEGRADED',
    service: 'orders-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    database: {
      postgresql: dbStatus,
    },
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    },
  });
});

app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    errors: [],
  });
});

app.use(errorHandler);

module.exports = app;
