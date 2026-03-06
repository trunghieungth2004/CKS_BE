const express = require('express');
const router = express.Router();
const rawMaterialController = require('../controllers/rawMaterialController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

router.get('/all', authMiddleware, roleMiddleware([1, 3]), rawMaterialController.getAllRawMaterials);

router.post('/one', authMiddleware, roleMiddleware([1, 3]), rawMaterialController.getRawMaterialById);

router.post('/create', authMiddleware, roleMiddleware([3]), strictLimiter, rawMaterialController.createRawMaterial);

router.put('/one', authMiddleware, roleMiddleware([3]), strictLimiter, rawMaterialController.updateRawMaterial);

router.delete('/one', authMiddleware, roleMiddleware([3]), strictLimiter, rawMaterialController.deleteRawMaterial);

module.exports = router;
