const productRepository = require('../repositories/productRepository');
const recipeRepository = require('../repositories/recipeRepository');
const recipeIngredientRepository = require('../repositories/recipeIngredientRepository');

const createProduct = async (payload, userId) => {
    const { product_name, product_description, price, weight_per_unit, shelf_life_days, recipe, ingredients } = payload;

    const product = await productRepository.create({
        product_name,
        product_description,
        price: parseFloat(price),
        weight_per_unit: parseFloat(weight_per_unit),
        shelf_life_days: shelf_life_days || 5,
        created_by: userId
    });

    if (recipe) {
        const recipeDoc = await recipeRepository.create({
            product_id: product.product_id,
            recipe_name: recipe.recipe_name || product_name,
            instructions: recipe.instructions || '',
            created_by: userId
        });

        if (ingredients && ingredients.length > 0) {
            for (const ingredient of ingredients) {
                await recipeIngredientRepository.create({
                    recipe_id: recipeDoc.recipe_id,
                    material_id: ingredient.material_id,
                    material_name: ingredient.material_name,
                    quantity_per_unit: ingredient.quantity_per_unit,
                    unit: ingredient.unit || 'kg'
                });
            }
        }
    }

    return product;
};

const getProducts = async () => {
    return productRepository.findAll();
};

const getProductById = async (productId) => {
    const product = await productRepository.findById(productId);
    if (!product) {
        return null;
    }

    const recipe = await recipeRepository.findByProductId(productId);
    let ingredients = [];

    if (recipe) {
        ingredients = await recipeIngredientRepository.findByRecipeId(recipe.recipe_id);
    }

    return {
        ...product,
        recipe,
        ingredients
    };
};

const updateProduct = async (productId, payload) => {
    const product = await productRepository.findById(productId);
    if (!product) {
        return null;
    }

    const { product_name, product_description, price, shelf_life_days } = payload;
    const updateData = {};

    if (product_name) updateData.product_name = product_name;
    if (product_description) updateData.product_description = product_description;
    if (price) updateData.price = parseFloat(price);
    if (shelf_life_days) updateData.shelf_life_days = shelf_life_days;

    return productRepository.update(productId, updateData);
};

const deleteProduct = async (productId) => {
    const product = await productRepository.findById(productId);
    if (!product) {
        return false;
    }

    await productRepository.deleteProduct(productId);
    return true;
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};