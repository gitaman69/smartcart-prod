require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product.routes');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'product-service ok' }));
app.use('/api/products', productRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Product DB connected');
    app.listen(process.env.PORT || 3002, () =>
      console.log(`✅ Product Service on port ${process.env.PORT || 3002}`)
    );
  })
  .catch((err) => console.error('❌ DB error:', err));