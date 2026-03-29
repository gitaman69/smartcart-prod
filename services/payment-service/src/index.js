require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('payment_success', { durable: true });
    console.log('✅ RabbitMQ connected (Payment Service)');
  } catch (err) {
    console.error('❌ RabbitMQ error:', err.message);
    setTimeout(connectRabbitMQ, 5000);
  }
};

app.get('/health', (req, res) => res.json({ status: 'payment-service ok' }));

// POST /api/payments/process
app.post('/api/payments/process', async (req, res) => {
  try {
    const { orderId, amount, userId } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: 'orderId and amount required' });
    }

    // Mock payment logic — in production replace with Razorpay / Stripe
    const isSuccess = Math.random() > 0.1; // 90% success rate mock

    if (!isSuccess) {
      return res.status(402).json({ message: 'Payment failed (mock)', orderId });
    }

    const paymentRecord = {
      paymentId: `PAY-${Date.now()}`,
      orderId,
      userId,
      amount,
      status: 'success',
      processedAt: new Date().toISOString(),
    };

    // Publish payment success event
    if (channel) {
      channel.sendToQueue(
        'payment_success',
        Buffer.from(JSON.stringify(paymentRecord)),
        { persistent: true }
      );
    }

    res.json({ message: 'Payment successful', payment: paymentRecord });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payments/:paymentId  — mock status check
app.get('/api/payments/:paymentId', (req, res) => {
  res.json({
    paymentId: req.params.paymentId,
    status: 'success',
    note: 'Mock data — connect to real payment gateway for production',
  });
});

connectRabbitMQ().then(() => {
  app.listen(process.env.PORT || 3004, () =>
    console.log(`✅ Payment Service on port ${process.env.PORT || 3004}`)
  );
});