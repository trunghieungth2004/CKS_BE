const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/all', authMiddleware, roleMiddleware([0]), userController.getAllUser);

router.post('/one', authMiddleware, userController.getOneUser);

router.put('/', authMiddleware, userController.updateUser);

router.delete('/users', authMiddleware, roleMiddleware([0]), userController.deleteUser);

module.exports = router;
