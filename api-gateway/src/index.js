require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { limiter, authLimiter } = require('./middleware/rateLimiter');
const { verifyToken } = require('./middleware/auth.middleware');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      products: process.env.PRODUCT_SERVICE_URL,
      orders: process.env.ORDER_SERVICE_URL,
      payments: process.env.PAYMENT_SERVICE_URL,
    },
  });
});

// ── Create proxies ONCE at startup ──
const authProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {'^/': '/api/auth/',},
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log('\n🟡 [PROXY → AUTH]');
      console.log('Incoming Path:', req.originalUrl);
      console.log('Forwarding To:', process.env.AUTH_SERVICE_URL + proxyReq.path);
      console.log('Method:', req.method);
    },

    proxyRes: (proxyRes, req, res) => {
      console.log('🟣 [AUTH → GATEWAY RESPONSE]');
      console.log('Status from Auth:', proxyRes.statusCode);
    },

    error: (err, req, res) => {
      console.log('🔴 [PROXY ERROR]');
      console.error(err.message);
      res.status(502).json({ message: 'Auth service unavailable' });
    },
  },
});

const productProxy = createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/products/' },
  on: {
    error: (err, req, res) => {
      res.status(502).json({ message: 'Product service unavailable' });
    },
  },
});

const orderProxy = createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/orders/' },
  on: {
    error: (err, req, res) => {
      res.status(502).json({ message: 'Order service unavailable' });
    },
  },
});

const paymentProxy = createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/payments/' },
  on: {
    error: (err, req, res) => {
      res.status(502).json({ message: 'Payment service unavailable' });
    },
  },
});

// ── Routes ──
app.use('/api/auth', authLimiter, authProxy);

app.use('/api/products', (req, res, next) => {
  if (req.method === 'GET') return next();
  verifyToken(req, res, next);
}, productProxy);

app.use('/api/orders', verifyToken, orderProxy);

app.use('/api/payments', verifyToken, paymentProxy);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.listen(PORT, () => console.log(`✅ API Gateway running on port ${PORT}`));