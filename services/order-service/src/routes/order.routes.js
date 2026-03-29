const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getMyOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.patch('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

module.exports = router;