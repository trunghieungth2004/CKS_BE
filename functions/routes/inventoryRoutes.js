const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/store', authMiddleware, roleMiddleware([4]), inventoryController.getStoreInventory);

router.post('/ck', authMiddleware, roleMiddleware([1, 3]), inventoryController.getCKInventory);

module.exports = router;
