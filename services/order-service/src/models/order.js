const mongoose = require('mongoose');
const { getPrimary, getReplica } = require('../config/db');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    items:  [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: String,
      city:   String,
      state:  String,
      zip:    String,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
);

const getPrimaryModel = () => getPrimary().model('Order', orderSchema);

const getReplicaModel = () => getReplica().model('Order', orderSchema);

module.exports = { getPrimaryModel, getReplicaModel };