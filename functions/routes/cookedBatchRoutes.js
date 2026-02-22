const express = require('express');
const router = express.Router();
const cookedBatchController = require('../controllers/cookedBatchController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/all', roleMiddleware([0, 2, 3]), cookedBatchController.getAllCookedBatches);

router.post('/one', roleMiddleware([0, 2, 3]), cookedBatchController.getCookedBatchById);

router.post('/by-order', roleMiddleware([0, 2, 3]), cookedBatchController.getCookedBatchesByOrder);

router.post('/by-store', roleMiddleware([0, 2, 3]), cookedBatchController.getCookedBatchesByStore);

module.exports = router;
