const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

router.post('/create', authMiddleware, roleMiddleware([4]), strictLimiter, orderController.createOrder);

router.post('/update-status', authMiddleware, roleMiddleware([0, 1, 2, 4]), strictLimiter, orderController.updateOrderStatus);

router.post('/one', authMiddleware, orderController.getOrder);

router.post('/my-orders', authMiddleware, roleMiddleware([4]), orderController.getMyOrders);

router.post('/all', authMiddleware, roleMiddleware([0, 1, 2]), orderController.getAllOrders);

module.exports = router;
