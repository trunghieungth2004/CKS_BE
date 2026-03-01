const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

router.post('/create', authMiddleware, roleMiddleware([3]), strictLimiter, productController.createProduct);

router.get('/all', authMiddleware, productController.getProducts);

router.post('/one', authMiddleware, productController.getProductById);

router.put('/one', authMiddleware, roleMiddleware([3]), strictLimiter, productController.updateProduct);

router.delete('/one', authMiddleware, roleMiddleware([0, 3]), strictLimiter, productController.deleteProduct);

module.exports = router;
