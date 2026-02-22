const express = require('express');
const router = express.Router();
const rawBatchController = require('../controllers/rawBatchController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/all', authMiddleware, roleMiddleware([0, 1, 3]), rawBatchController.getAllBatches);

router.post('/one', authMiddleware, roleMiddleware([0, 1, 3]), rawBatchController.getOneBatch);

router.post('/consumption', authMiddleware, roleMiddleware([0, 1, 3]), rawBatchController.getBatchConsumption);

router.post('/supplier', authMiddleware, roleMiddleware([0, 1, 3]), rawBatchController.getBatchesBySupplier);

module.exports = router;
