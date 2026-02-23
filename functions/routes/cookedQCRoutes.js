const express = require('express');
const router = express.Router();
const cookedQCController = require('../controllers/cookedQCController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

router.post('/pending', authMiddleware, roleMiddleware([2]), cookedQCController.getPendingProductQC);

router.post('/perform', authMiddleware, roleMiddleware([2]), strictLimiter, cookedQCController.performProductQC);

router.post('/credits', authMiddleware, roleMiddleware([0, 3, 4]), cookedQCController.getStoreCredits);

router.post('/risk-pool', authMiddleware, roleMiddleware([0, 2, 3]), cookedQCController.getRiskPoolTransfers);

router.post('/risk-pool/search', authMiddleware, roleMiddleware([2]), cookedQCController.searchRiskPoolStores);

router.post('/risk-pool/transfer', authMiddleware, roleMiddleware([2]), strictLimiter, cookedQCController.transferFromRiskPool);

module.exports = router;
