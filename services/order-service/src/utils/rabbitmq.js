const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // Declare queues (idempotent — safe to call on startup)
    await channel.assertQueue('order_created', { durable: true });
    await channel.assertQueue('payment_success', { durable: true });

    console.log('✅ RabbitMQ connected (Order Service)');
    return channel;
  } catch (err) {
    console.error('❌ RabbitMQ connection error:', err.message);
    // Retry after 5 seconds
    setTimeout(connectRabbitMQ, 5000);
  }
};

const publishMessage = (queue, payload) => {
  if (!channel) {
    console.error('RabbitMQ channel not available');
    return;
  }
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
  console.log(`📤 Published to ${queue}:`, payload);
};

module.exports = { connectRabbitMQ, publishMessage };