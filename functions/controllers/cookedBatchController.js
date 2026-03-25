const cookedBatchService = require('../services/cookedBatchService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllCookedBatches = async (req, res) => {
    try {
        const { qc_status, cook_date } = req.body;
        const batches = await cookedBatchService.getAllCookedBatches(qc_status, cook_date);
        
        return successResponse(res, 200, 'Cooked batches retrieved successfully', batches);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getCookedBatchById = async (req, res) => {
    try {
        const { batch_id } = req.body;
        
        if (!batch_id) {
            return errorResponse(res, 400, 'batch_id is required', 'VAL100');
        }
        
        const batch = await cookedBatchService.getCookedBatchById(batch_id);
        
        if (!batch) {
            return errorResponse(res, 404, 'Cooked batch not found', 'BAT103');
        }
        
        return successResponse(res, 200, 'Cooked batch retrieved successfully', batch);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getCookedBatchesByOrder = async (req, res) => {
    try {
        const { order_id } = req.body;
        
        if (!order_id) {
            return errorResponse(res, 400, 'order_id is required', 'VAL100');
        }
        
        const batches = await cookedBatchService.getCookedBatchesByOrder(order_id);
        if (batches?.error) {
            return errorResponse(res, batches.statusCode, batches.error, batches.statusId);
        }
        
        return successResponse(res, 200, 'Cooked batches retrieved successfully', batches);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getCookedBatchesByStore = async (req, res) => {
    try {
        const { store_id } = req.body;
        
        if (!store_id) {
            return errorResponse(res, 400, 'store_id is required', 'VAL100');
        }
        
        const batches = await cookedBatchService.getCookedBatchesByStore(store_id);
        
        return successResponse(res, 200, 'Cooked batches retrieved successfully', batches);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

module.exports = {
    getAllCookedBatches,
    getCookedBatchById,
    getCookedBatchesByOrder,
    getCookedBatchesByStore
};
