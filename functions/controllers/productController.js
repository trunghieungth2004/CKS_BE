const productRepository = require('../repositories/productRepository');
const recipeRepository = require('../repositories/recipeRepository');
const recipeIngredientRepository = require('../repositories/recipeIngredientRepository');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const createProduct = async (req, res) => {
    try {
        const { product_name, product_description, price, weight_per_unit, shelf_life_days, recipe, ingredients } = req.body;

        if (!price || price <= 0) {
            return errorResponse(res, 400, 'Valid price is required', 'VAL100');
        }

        if (!weight_per_unit || weight_per_unit <= 0) {
            return errorResponse(res, 400, 'Valid weight_per_unit (in kg) is required', 'VAL100');
        }

        const product = await productRepository.create({
            product_name,
            product_description,
            price: parseFloat(price),
            weight_per_unit: parseFloat(weight_per_unit),
            shelf_life_days: shelf_life_days || 5,
            created_by: req.user.uid
        });

        if (recipe) {
            const recipeDoc = await recipeRepository.create({
                product_id: product.product_id,
                recipe_name: recipe.recipe_name || product_name,
                instructions: recipe.instructions || '',
                created_by: req.user.uid
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

        return successResponse(res, 201, 'Product created successfully', {
            product_id: product.product_id,
            product_name: product.product_name
        }, 'PROD100');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await productRepository.findAll();
        return successResponse(res, 200, 'Products retrieved successfully', products, 'PROD104');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const product = await productRepository.findById(productId);
        
        if (!product) {
            return errorResponse(res, 404, 'Product not found');
        }

        const recipe = await recipeRepository.findByProductId(productId);
        let ingredients = [];
        
        if (recipe) {
            ingredients = await recipeIngredientRepository.findByRecipeId(recipe.recipe_id);
        }

        return successResponse(res, 200, 'Product retrieved successfully', {
            ...product,
            recipe,
            ingredients
        });
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { product_name, product_description, price, shelf_life_days } = req.body;

        const product = await productRepository.findById(productId);
        
        if (!product) {
            return errorResponse(res, 404, 'Product not found', 'PROD103');
        }

        const updateData = {};
        if (product_name) updateData.product_name = product_name;
        if (product_description) updateData.product_description = product_description;
        if (price) updateData.price = parseFloat(price);
        if (shelf_life_days) updateData.shelf_life_days = shelf_life_days;

        const updated = await productRepository.update(productId, updateData);

        return successResponse(res, 200, 'Product updated successfully', updated, 'PROD101');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await productRepository.findById(productId);
        
        if (!product) {
            return errorResponse(res, 404, 'Product not found', 'PROD103');
        }

        await productRepository.deleteProduct(productId);

        return successResponse(res, 200, 'Product deleted successfully', null, 'PROD102');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
