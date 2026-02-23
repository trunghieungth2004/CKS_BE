const express = require('express');
const router = express.Router();
const rawQCController = require('../controllers/rawQCController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

router.get('/pending', authMiddleware, roleMiddleware([1]), rawQCController.getPendingQC);

router.post('/perform', authMiddleware, roleMiddleware([1]), strictLimiter, rawQCController.performQC);

module.exports = router;
