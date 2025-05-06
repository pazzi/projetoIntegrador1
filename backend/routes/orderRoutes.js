const express = require('express');
const OrderController = require('../controllers/OrderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, OrderController.createOrder);
router.get('/user/:userId', authMiddleware, OrderController.getUserOrders);
router.get('/:id', authMiddleware, OrderController.getOrderById);
router.put('/:id/status', authMiddleware, OrderController.updateOrderStatus);

module.exports = router;