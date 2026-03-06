const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

router.get('/all', authMiddleware, roleMiddleware([1, 3]), supplierController.getAllSuppliers);

router.post('/one', authMiddleware, roleMiddleware([1, 3]), supplierController.getSupplierById);

router.post('/create', authMiddleware, roleMiddleware([3]), strictLimiter, supplierController.createSupplier);

router.put('/one', authMiddleware, roleMiddleware([3]), strictLimiter, supplierController.updateSupplier);

router.delete('/one', authMiddleware, roleMiddleware([3]), strictLimiter, supplierController.deleteSupplier);

module.exports = router;
