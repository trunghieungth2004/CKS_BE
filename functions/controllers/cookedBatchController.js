const cookedBatchRepository = require('../repositories/cookedBatchRepository');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllCookedBatches = async (req, res) => {
    try {
        const snapshot = await cookedBatchRepository.collection
            .orderBy('created_at', 'desc')
            .get();
        
        const batches = snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
        
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
        
        const batch = await cookedBatchRepository.findById(batch_id);
        
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
        
        const batches = await cookedBatchRepository.findByOrderId(order_id);
        
        if (!batches || batches.length === 0) {
            return errorResponse(res, 404, 'No cooked batches found for this order', 'BAT103');
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
        
        const batches = await cookedBatchRepository.findByStoreId(store_id);
        
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
