const rawBatchRepository = require('../repositories/rawBatchRepository');
const batchConsumptionRepository = require('../repositories/batchConsumptionRepository');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllBatches = async (req, res) => {
    try {
        const { qc_status, batch_date } = req.body;
        
        let batches;
        
        if (qc_status) {
            batches = await rawBatchRepository.findByQCStatus(qc_status);
        } else if (batch_date) {
            batches = await rawBatchRepository.findByDate(batch_date);
        } else {
            batches = await rawBatchRepository.findAll();
        }
        
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
        
        const batch = await rawBatchRepository.findById(batch_id);
        
        if (!batch) {
            return errorResponse(res, 404, 'Batch not found', 'QC103');
        }
        
        const replacedBatch = batch.replaced_batch_id 
            ? await rawBatchRepository.findById(batch.replaced_batch_id)
            : null;
        
        const replacementBatches = await rawBatchRepository.findReplacementBatches(batch_id);
        
        return successResponse(res, 200, 'Batch retrieved successfully', {
            batch,
            replaced_batch: replacedBatch,
            replacement_batches: replacementBatches
        });
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getBatchConsumption = async (req, res) => {
    try {
        const { order_id, material_id, start_date, end_date } = req.body;
        
        let consumption;
        
        if (order_id) {
            consumption = await batchConsumptionRepository.findByOrderId(order_id);
        } else if (material_id) {
            consumption = await batchConsumptionRepository.findByMaterialId(material_id);
        } else if (start_date && end_date) {
            consumption = await batchConsumptionRepository.findByDateRange(start_date, end_date);
        } else {
            consumption = await batchConsumptionRepository.findAll();
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
        
        const batches = await rawBatchRepository.findBySupplierId(supplier_id);
        
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
