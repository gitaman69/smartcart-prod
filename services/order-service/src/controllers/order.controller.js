const {getPrimaryModel, getReplicaModel} = require('../models/order');
const { publishMessage } = require('../utils/rabbitmq');

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const Order = getPrimaryModel(); // Use primary for writes
    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount,
      shippingAddress,
    });

    // Emit event to RabbitMQ — notification service will consume this
    publishMessage('order_created', {
      orderId: order._id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      items: order.items,
      createdAt: order.createdAt,
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders  — user's own orders
exports.getMyOrders = async (req, res) => {
  try {
    const Order = getReplicaModel(); // Use replica for reads
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const Order = getReplicaModel(); // Use replica for reads
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only owner can view
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/status  — admin only
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Status updated', order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};