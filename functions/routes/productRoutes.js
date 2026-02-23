const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

router.post('/create', authMiddleware, roleMiddleware([3]), strictLimiter, productController.createProduct);

router.get('/all', authMiddleware, productController.getProducts);

router.get('/:productId', authMiddleware, productController.getProductById);

router.put('/:productId', authMiddleware, roleMiddleware([3]), strictLimiter, productController.updateProduct);

router.delete('/:productId', authMiddleware, roleMiddleware([0, 3]), strictLimiter, productController.deleteProduct);

module.exports = router;
