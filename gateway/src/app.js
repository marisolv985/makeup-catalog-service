const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('short'));

const proxyOpts = (target) => ({
  target,
  changeOrigin: true,
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/cosmetics', createProxyMiddleware(proxyOpts('http://makeup-catalog-service:3001')));
app.use('/api/v1/orders', createProxyMiddleware(proxyOpts('http://orders-service:3002')));
app.use('/api/v1/cart', createProxyMiddleware(proxyOpts('http://orders-service:3002')));
app.use('/api/v1/reviews', createProxyMiddleware(proxyOpts('http://review-service:3004')));
app.use('/api/v1/alerts', createProxyMiddleware(proxyOpts('http://review-service:3004')));

app.use('/', createProxyMiddleware(proxyOpts('http://makeup-catalog-service:3001')));

module.exports = app;
