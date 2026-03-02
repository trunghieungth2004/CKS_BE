const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

router.post('/all', authMiddleware, roleMiddleware([0]), userController.getAllUser);

router.post('/one', authMiddleware, userController.getOneUser);

router.put('/', authMiddleware, strictLimiter, userController.updateUser);

router.delete('/users', authMiddleware, roleMiddleware([0]), strictLimiter, userController.deleteUser);

router.post('/store-info', authMiddleware, roleMiddleware([4]), userController.getStoreInfo);

module.exports = router;
