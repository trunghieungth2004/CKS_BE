const express = require('express');
const router = express.Router();
const rawQCController = require('../controllers/rawQCController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/pending', authMiddleware, roleMiddleware([1]), rawQCController.getPendingQC);

router.post('/perform', authMiddleware, roleMiddleware([1]), rawQCController.performQC);

module.exports = router;
