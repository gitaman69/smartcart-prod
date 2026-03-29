require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
  console.log('\n🟢 [AUTH SERVICE INCOMING]');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);

  const start = Date.now();

  res.on('finish', () => {
    console.log('🔵 [AUTH SERVICE RESPONSE]');
    console.log('Status:', res.statusCode);
    console.log('Time:', Date.now() - start, 'ms\n');
  });

  next();
});

// Health
app.get('/health', (req, res) => res.json({ status: 'auth-service ok' }));

// Routes
app.use('/api/auth', authRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Auth DB connected');
    app.listen(PORT, () => console.log(`✅ Auth Service on port ${PORT}`));
  })
  .catch((err) => console.error('❌ DB connection failed:', err.message));