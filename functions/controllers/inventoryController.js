const inventoryService = require('../services/inventoryService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getStoreInventory = async (req, res) => {
    try {
        const userId = req.user.uid;

        const result = await inventoryService.getStoreInventory(userId);

        if (!result) {
            return errorResponse(res, 404, 'Store staff record not found', 'INV100');
        }

        return successResponse(res, 200, 'Store inventory retrieved successfully', result, 'INV101');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getCKInventory = async (req, res) => {
    try {
        const result = await inventoryService.getCKInventory();
        return successResponse(res, 200, 'CK inventory retrieved successfully', result, 'INV102');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getStoreRiskPoolInventory = async (req, res) => {
    try {
        const userId = req.user.uid;

        const result = await inventoryService.getStoreRiskPoolInventory(userId);

        if (!result) {
            return errorResponse(res, 404, 'Store staff record not found', 'INV100');
        }

        return successResponse(res, 200, 'Store risk pool inventory retrieved successfully', result, 'INV103');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

module.exports = {
    getStoreInventory,
    getCKInventory,
    getStoreRiskPoolInventory
};
