const productService = require('../services/productService');
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

        const product = await productService.createProduct({
            product_name,
            product_description,
            price,
            weight_per_unit,
            shelf_life_days,
            recipe,
            ingredients
        }, req.user.uid);

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
        const products = await productService.getProducts();
        return successResponse(res, 200, 'Products retrieved successfully', products, 'PROD104');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const getProductById = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return errorResponse(res, 400, 'Product ID is required', 'VAL100');
        }
        
        const product = await productService.getProductById(productId);
        
        if (!product) {
            return errorResponse(res, 404, 'Product not found', 'PROD103');
        }

        return successResponse(res, 200, 'Product retrieved successfully', product);
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const updateProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return errorResponse(res, 400, 'Product ID is required', 'VAL100');
        }

        const updated = await productService.updateProduct(productId, req.body);

        if (!updated) {
            return errorResponse(res, 404, 'Product not found', 'PROD103');
        }

        return successResponse(res, 200, 'Product updated successfully', updated, 'PROD101');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return errorResponse(res, 400, 'Product ID is required', 'VAL100');
        }

        const deleted = await productService.deleteProduct(productId);

        if (!deleted) {
            return errorResponse(res, 404, 'Product not found', 'PROD103');
        }

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
