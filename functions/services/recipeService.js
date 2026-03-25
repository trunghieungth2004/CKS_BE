const recipeRepository = require('../repositories/recipeRepository');
const recipeIngredientRepository = require('../repositories/recipeIngredientRepository');
const productRepository = require('../repositories/productRepository');

const getAllRecipes = async () => {
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

    return enrichedRecipes;
};

const getRecipeById = async (recipeId) => {
    const recipe = await recipeRepository.findById(recipeId);
    if (!recipe) {
        return null;
    }

    const ingredients = await recipeIngredientRepository.findByRecipeId(recipeId);
    const product = await productRepository.findById(recipe.product_id);

    return {
        ...recipe,
        product_name: product?.product_name || 'N/A',
        ingredients
    };
};

const getRecipeByProductId = async (productId) => {
    const recipe = await recipeRepository.findByProductId(productId);
    if (!recipe) {
        return null;
    }

    const ingredients = await recipeIngredientRepository.findByRecipeId(recipe.recipe_id);

    return {
        ...recipe,
        ingredients
    };
};

const createRecipe = async (payload, userId) => {
    const { product_id, recipe_name, instructions, ingredients } = payload;

    const product = await productRepository.findById(product_id);
    if (!product) {
        return { error: 'Product not found', statusCode: 404, statusId: 'PROD103' };
    }

    const existingRecipe = await recipeRepository.findByProductId(product_id);
    if (existingRecipe) {
        return { error: 'Recipe already exists for this product', statusCode: 400, statusId: 'REC104' };
    }

    const recipe = await recipeRepository.create({
        product_id,
        recipe_name,
        instructions: instructions || '',
        created_by: userId
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

    return {
        ...recipe,
        ingredients: savedIngredients
    };
};

const updateRecipe = async (payload) => {
    const { recipe_id, recipe_name, instructions, ingredients } = payload;

    const existingRecipe = await recipeRepository.findById(recipe_id);
    if (!existingRecipe) {
        return { error: 'Recipe not found', statusCode: 404, statusId: 'REC103' };
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
                recipe_id,
                material_id: ingredient.material_id,
                material_name: ingredient.material_name || '',
                quantity_per_unit: ingredient.quantity_per_unit,
                unit: ingredient.unit || 'kg'
            });
        }
    }

    const updatedIngredients = await recipeIngredientRepository.findByRecipeId(recipe_id);

    return {
        recipe_id,
        ingredients: updatedIngredients
    };
};

const deleteRecipe = async (recipeId) => {
    const existingRecipe = await recipeRepository.findById(recipeId);
    if (!existingRecipe) {
        return { error: 'Recipe not found', statusCode: 404, statusId: 'REC103' };
    }

    const ingredients = await recipeIngredientRepository.findByRecipeId(recipeId);
    for (const ingredient of ingredients) {
        await recipeIngredientRepository.deleteIngredient(ingredient.ingredient_id);
    }

    await recipeRepository.deleteRecipe(recipeId);
    return { recipe_id: recipeId };
};

module.exports = {
    getAllRecipes,
    getRecipeById,
    getRecipeByProductId,
    createRecipe,
    updateRecipe,
    deleteRecipe
};