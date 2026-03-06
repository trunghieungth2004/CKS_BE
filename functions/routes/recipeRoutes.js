const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

router.get('/all', authMiddleware, roleMiddleware([1, 3]), recipeController.getAllRecipes);

router.post('/one', authMiddleware, roleMiddleware([1, 3]), recipeController.getRecipeById);

router.post('/by-product', authMiddleware, roleMiddleware([1, 3]), recipeController.getRecipeByProductId);

router.post('/create', authMiddleware, roleMiddleware([3]), strictLimiter, recipeController.createRecipe);

router.put('/one', authMiddleware, roleMiddleware([3]), strictLimiter, recipeController.updateRecipe);

router.delete('/one', authMiddleware, roleMiddleware([3]), strictLimiter, recipeController.deleteRecipe);

module.exports = router;
