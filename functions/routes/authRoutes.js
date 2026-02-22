const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/register', authMiddleware, roleMiddleware([0]), authController.register);

router.post('/login', authController.login);

router.post('/verify', authController.verifyToken);

module.exports = router;
