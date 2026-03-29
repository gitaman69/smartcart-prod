require('dotenv').config();
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL;

const sendEmailNotification = (type, data) => {
  // Replace with nodemailer / SendGrid / SES in production
  console.log(`\n📧 [EMAIL NOTIFICATION] Type: ${type}`);
  console.log('   Data:', JSON.stringify(data, null, 2));
};

const connectAndConsume = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Declare queues (safe if already declared by producer)
    await channel.assertQueue('order_created', { durable: true });
    await channel.assertQueue('payment_success', { durable: true });

    // Process one message at a time
    channel.prefetch(1);

    console.log('✅ Notification Service connected — waiting for messages...');

    // ── Consumer 1: Order Created ──
    channel.consume('order_created', (msg) => {
      if (!msg) return;
      try {
        const order = JSON.parse(msg.content.toString());
        console.log('\n🛒 [ORDER CREATED] Received:', order.orderId);

        sendEmailNotification('ORDER_CONFIRMATION', {
          to: `user-${order.userId}@example.com`,
          subject: 'Your SmartCart order has been placed!',
          orderId: order.orderId,
          totalAmount: order.totalAmount,
          items: order.items,
        });

        channel.ack(msg); // Acknowledge — remove from queue
      } catch (err) {
        console.error('❌ Failed to process order_created msg:', err.message);
        channel.nack(msg, false, false); // Dead-letter it
      }
    });

    // ── Consumer 2: Payment Success ──
    channel.consume('payment_success', (msg) => {
      if (!msg) return;
      try {
        const payment = JSON.parse(msg.content.toString());
        console.log('\n💳 [PAYMENT SUCCESS] Received:', payment.paymentId);

        sendEmailNotification('PAYMENT_RECEIPT', {
          to: `user-${payment.userId}@example.com`,
          subject: 'Payment confirmed for your SmartCart order',
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          amount: payment.amount,
        });

        channel.ack(msg);
      } catch (err) {
        console.error('❌ Failed to process payment_success msg:', err.message);
        channel.nack(msg, false, false);
      }
    });

    // Handle connection close gracefully
    connection.on('close', () => {
      console.error('🔌 RabbitMQ connection closed. Retrying in 5s...');
      setTimeout(connectAndConsume, 5000);
    });
  } catch (err) {
    console.error('❌ RabbitMQ connection failed:', err.message, '— retrying in 5s');
    setTimeout(connectAndConsume, 5000);
  }
};

connectAndConsume();