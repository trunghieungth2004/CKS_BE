const recipeRepository = require('../repositories/recipeRepository');
const recipeIngredientRepository = require('../repositories/recipeIngredientRepository');
const productRepository = require('../repositories/productRepository');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllRecipes = async (req, res) => {
    try {
        const recipes = await recipeRepository.findAll();
        
        const enrichedRecipes = [];
        for (const recipe of recipes) {
            const ingredients = await recipeIngredientRepository.findByRecipeId(recipe.recipe_id);
            const product = await productRepository.findById(recipe.product_id);
            
            enrichedRecipes.push({
                ...recipe,
                product_name: product?.product_name || 'N/A',
                ingredients
            });
        }
        
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

        const recipe = await recipeRepository.findById(recipe_id);
        
        if (!recipe) {
            return errorResponse(res, 404, 'Recipe not found', 'REC103');
        }

        const ingredients = await recipeIngredientRepository.findByRecipeId(recipe_id);
        const product = await productRepository.findById(recipe.product_id);

        return successResponse(res, 200, 'Recipe retrieved successfully', {
            ...recipe,
            product_name: product?.product_name || 'N/A',
            ingredients
        });
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

        const recipe = await recipeRepository.findByProductId(product_id);
        
        if (!recipe) {
            return errorResponse(res, 404, 'Recipe not found for this product', 'REC103');
        }

        const ingredients = await recipeIngredientRepository.findByRecipeId(recipe.recipe_id);

        return successResponse(res, 200, 'Recipe retrieved successfully', {
            ...recipe,
            ingredients
        });
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

        const product = await productRepository.findById(product_id);
        if (!product) {
            return errorResponse(res, 404, 'Product not found', 'PROD103');
        }

        const existingRecipe = await recipeRepository.findByProductId(product_id);
        if (existingRecipe) {
            return errorResponse(res, 400, 'Recipe already exists for this product', 'REC104');
        }

        const recipe = await recipeRepository.create({
            product_id,
            recipe_name,
            instructions: instructions || '',
            created_by: req.user.uid
        });

        if (ingredients && ingredients.length > 0) {
            for (const ingredient of ingredients) {
                if (!ingredient.material_id || !ingredient.quantity_per_unit) {
                    continue;
                }
                
                await recipeIngredientRepository.create({
                    recipe_id: recipe.recipe_id,
                    material_id: ingredient.material_id,
                    material_name: ingredient.material_name || '',
                    quantity_per_unit: ingredient.quantity_per_unit,
                    unit: ingredient.unit || 'kg'
                });
            }
        }

        const savedIngredients = await recipeIngredientRepository.findByRecipeId(recipe.recipe_id);

        return successResponse(res, 201, 'Recipe created successfully', {
            ...recipe,
            ingredients: savedIngredients
        }, 'REC100');
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

        const existingRecipe = await recipeRepository.findById(recipe_id);
        if (!existingRecipe) {
            return errorResponse(res, 404, 'Recipe not found', 'REC103');
        }

        const updateData = {};
        if (recipe_name !== undefined) updateData.recipe_name = recipe_name;
        if (instructions !== undefined) updateData.instructions = instructions;

        await recipeRepository.update(recipe_id, updateData);

        if (ingredients && Array.isArray(ingredients)) {
            const existingIngredients = await recipeIngredientRepository.findByRecipeId(recipe_id);
            
            for (const existing of existingIngredients) {
                await recipeIngredientRepository.deleteIngredient(existing.ingredient_id);
            }

            for (const ingredient of ingredients) {
                if (!ingredient.material_id || !ingredient.quantity_per_unit) {
                    continue;
                }
                
                await recipeIngredientRepository.create({
                    recipe_id: recipe_id,
                    material_id: ingredient.material_id,
                    material_name: ingredient.material_name || '',
                    quantity_per_unit: ingredient.quantity_per_unit,
                    unit: ingredient.unit || 'kg'
                });
            }
        }

        const updatedIngredients = await recipeIngredientRepository.findByRecipeId(recipe_id);

        return successResponse(res, 200, 'Recipe updated successfully', {
            recipe_id,
            ingredients: updatedIngredients
        });
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

        const existingRecipe = await recipeRepository.findById(recipe_id);
        if (!existingRecipe) {
            return errorResponse(res, 404, 'Recipe not found', 'REC103');
        }

        const ingredients = await recipeIngredientRepository.findByRecipeId(recipe_id);
        for (const ingredient of ingredients) {
            await recipeIngredientRepository.deleteIngredient(ingredient.ingredient_id);
        }

        await recipeRepository.delete(recipe_id);

        return successResponse(res, 200, 'Recipe deleted successfully', { recipe_id });
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
