const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');
const handleMulterErrors = require('./middlewares/handleMulterErrors');
const cosmeticsRoutes = require('./routes/cosmeticsRoutes');
const viewRoutes = require('./routes/views/viewRoutes');
const authRoutes = require('./routes/authRoutes');
const { JWT_SECRET, CORS_ORIGIN } = require('./config/constants');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cookieParser());

app.use((req, res, next) => {
  req.user = null;
  const token = req.cookies && req.cookies.gf_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      res.clearCookie('gf_token');
    }
  }
  res.locals.user = req.user;
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GlowFlow Catalog API Docs',
}));

app.get('/health', async (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: dbStatus === 'UP' ? 'UP' : 'DEGRADED',
    service: 'makeup-catalog-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    database: {
      mongodb: dbStatus,
    },
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    },
  });
});

app.use('/api/v1/cosmetics', cosmeticsRoutes);

app.use('/', authRoutes);
app.use('/', viewRoutes);

app.use(handleMulterErrors);

app.use((_req, res) => {
  res.status(404).render('errors/404', {
    title: 'Página no encontrada',
    currentPath: _req.path,
  });
});

app.use(errorHandler);

module.exports = app;
