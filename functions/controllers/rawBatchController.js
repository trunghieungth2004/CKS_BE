const rawBatchService = require('../services/rawBatchService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllBatches = async (req, res) => {
    try {
        const { qc_status, batch_date } = req.body;
        const batches = await rawBatchService.getAllBatches(qc_status, batch_date);
        return successResponse(res, 200, 'Batches retrieved successfully', batches);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getOneBatch = async (req, res) => {
    try {
        const { batch_id } = req.body;
        
        if (!batch_id) {
            return errorResponse(res, 400, 'batch_id is required', 'VAL100');
        }
        
        const result = await rawBatchService.getOneBatch(batch_id);

        if (!result) {
            return errorResponse(res, 404, 'Batch not found', 'QC103');
        }

        return successResponse(res, 200, 'Batch retrieved successfully', result);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getBatchConsumption = async (req, res) => {
    try {
        const { order_id, material_id, start_date, end_date } = req.body;
        
        const consumption = await rawBatchService.getBatchConsumption({
            order_id,
            material_id,
            start_date,
            end_date
        });

        if (consumption?.error) {
            return errorResponse(res, consumption.statusCode, consumption.error, consumption.statusId);
        }
        
        return successResponse(res, 200, 'Batch consumption retrieved successfully', consumption);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getBatchesBySupplier = async (req, res) => {
    try {
        const { supplier_id } = req.body;
        
        if (!supplier_id) {
            return errorResponse(res, 400, 'supplier_id is required', 'VAL100');
        }
        
        const batches = await rawBatchService.getBatchesBySupplier(supplier_id);
        if (batches?.error) {
            return errorResponse(res, batches.statusCode, batches.error, batches.statusId);
        }

        return successResponse(res, 200, 'Batches retrieved successfully', batches);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

module.exports = {
    getAllBatches,
    getOneBatch,
    getBatchConsumption,
    getBatchesBySupplier
};
