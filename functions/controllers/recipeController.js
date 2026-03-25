const recipeService = require('../services/recipeService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllRecipes = async (req, res) => {
    try {
        const enrichedRecipes = await recipeService.getAllRecipes();
        
        return successResponse(res, 200, 'Recipes retrieved successfully', enrichedRecipes);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getRecipeById = async (req, res) => {
    try {
        const { recipe_id } = req.body;

        if (!recipe_id) {
            return errorResponse(res, 400, 'recipe_id is required', 'VAL100');
        }

        const recipe = await recipeService.getRecipeById(recipe_id);
        
        if (!recipe) {
            return errorResponse(res, 404, 'Recipe not found', 'REC103');
        }

        return successResponse(res, 200, 'Recipe retrieved successfully', recipe);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getRecipeByProductId = async (req, res) => {
    try {
        const { product_id } = req.body;

        if (!product_id) {
            return errorResponse(res, 400, 'product_id is required', 'VAL100');
        }

        const recipe = await recipeService.getRecipeByProductId(product_id);
        
        if (!recipe) {
            return errorResponse(res, 404, 'Recipe not found for this product', 'REC103');
        }

        return successResponse(res, 200, 'Recipe retrieved successfully', recipe);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const createRecipe = async (req, res) => {
    try {
        const { product_id, recipe_name, instructions, ingredients } = req.body;

        if (!product_id) {
            return errorResponse(res, 400, 'product_id is required', 'VAL100');
        }

        if (!recipe_name) {
            return errorResponse(res, 400, 'recipe_name is required', 'VAL100');
        }

        const result = await recipeService.createRecipe({ product_id, recipe_name, instructions, ingredients }, req.user.uid);

        if (result?.error) {
            return errorResponse(res, result.statusCode, result.error, result.statusId);
        }

        return successResponse(res, 201, 'Recipe created successfully', result, 'REC100');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const updateRecipe = async (req, res) => {
    try {
        const { recipe_id, recipe_name, instructions, ingredients } = req.body;

        if (!recipe_id) {
            return errorResponse(res, 400, 'recipe_id is required', 'VAL100');
        }

        const result = await recipeService.updateRecipe({ recipe_id, recipe_name, instructions, ingredients });

        if (result?.error) {
            return errorResponse(res, result.statusCode, result.error, result.statusId);
        }

        return successResponse(res, 200, 'Recipe updated successfully', result);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const { recipe_id } = req.body;

        if (!recipe_id) {
            return errorResponse(res, 400, 'recipe_id is required', 'VAL100');
        }

        const result = await recipeService.deleteRecipe(recipe_id);

        if (result?.error) {
            return errorResponse(res, result.statusCode, result.error, result.statusId);
        }

        return successResponse(res, 200, 'Recipe deleted successfully', result);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

module.exports = {
    getAllRecipes,
    getRecipeById,
    getRecipeByProductId,
    createRecipe,
    updateRecipe,
    deleteRecipe
};
