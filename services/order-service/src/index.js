require('dotenv').config();
const express = require('express');
const orderRoutes = require('./routes/order.routes');
const { connectDatabases } = require('./config/db');
const { connectRabbitMQ } = require('./utils/rabbitmq');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'order-service ok' }));
app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const start = async () => {
  try {
    // Connect primary + replica
    await connectDatabases();

    // Connect RabbitMQ
    await connectRabbitMQ();

    app.listen(process.env.PORT || 3003, () => {
      console.log(`✅ Order Service on port ${process.env.PORT || 3003}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
};

start();