const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/dispute', authMiddleware, roleMiddleware([4]), disputeController.fileDispute);

router.post('/disputes/order', authMiddleware, roleMiddleware([0, 3, 4]), disputeController.getDisputesByOrder);

router.post('/disputes/all', authMiddleware, roleMiddleware([0, 3]), disputeController.getAllDisputes);

router.post('/disputes/my-disputes', authMiddleware, roleMiddleware([4]), disputeController.getMyDisputes);

router.post('/dispute/resolve', authMiddleware, roleMiddleware([0, 3]), disputeController.resolveDispute);

module.exports = router;
