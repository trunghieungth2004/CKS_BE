const cookedQCService = require('../services/cookedQCService');
const storeCreditRepository = require('../repositories/storeCreditRepository');
const riskPoolTransferRepository = require('../repositories/riskPoolTransferRepository');
const storeStaffRepository = require('../repositories/storeStaffRepository');
const orderRepository = require('../repositories/orderRepository');
const cookedBatchRepository = require('../repositories/cookedBatchRepository');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getPendingProductQC = async (req, res) => {
    try {
        const pendingBatches = await cookedQCService.getPendingProductQC();
        return successResponse(res, 200, 'Pending cooked product QC retrieved successfully', pendingBatches);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const performProductQC = async (req, res) => {
    try {
        const { batch_id, qc_result, failed_items, notes } = req.body;

        if (!batch_id) {
            return errorResponse(res, 400, 'batch_id is required', 'VAL100');
        }

        const batchExists = await cookedBatchRepository.findById(batch_id);
        if (!batchExists) {
            return errorResponse(res, 404, 'Batch not found', 'QC103');
        }

        if (!['PASS', 'FAIL'].includes(qc_result)) {
            return errorResponse(res, 400, 'qc_result must be PASS or FAIL', 'VAL103');
        }

        if (qc_result === 'FAIL' && (!failed_items || failed_items.length === 0)) {
            return errorResponse(res, 400, 'failed_items is required when qc_result is FAIL', 'VAL100');
        }

        const result = await cookedQCService.performProductQC(
            batch_id,
            qc_result,
            req.user.uid,
            failed_items,
            notes
        );

        const statusCode = result.success ? 'QC100' : 'QC101';
        return successResponse(res, 200, result.message, result, statusCode);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getStoreCredits = async (req, res) => {
    try {
        const { store_staff_id } = req.body;

        if (!store_staff_id) {
            return errorResponse(res, 400, 'store_staff_id is required', 'VAL100');
        }

        const storeStaffExists = await storeStaffRepository.findById(store_staff_id);
        if (!storeStaffExists) {
            return errorResponse(res, 404, 'Store staff not found', 'USER103');
        }

        const credits = await storeCreditRepository.findByStoreStaffId(store_staff_id);
        const totalCredits = await storeCreditRepository.getTotalCredits(store_staff_id);

        return successResponse(res, 200, 'Store credits retrieved successfully', {
            credits,
            total_credits: totalCredits
        });
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getRiskPoolTransfers = async (req, res) => {
    try {
        const { order_id, store_staff_id } = req.body;

        if (order_id) {
            const orderExists = await orderRepository.findById(order_id);
            if (!orderExists) {
                return errorResponse(res, 404, 'Order not found', 'DB101');
            }
        }

        if (store_staff_id) {
            const storeStaffExists = await storeStaffRepository.findById(store_staff_id);
            if (!storeStaffExists) {
                return errorResponse(res, 404, 'Store staff not found', 'USER103');
            }
        }

        let transfers;
        if (order_id) {
            transfers = await riskPoolTransferRepository.findByOrderId(order_id);
        } else if (store_staff_id) {
            transfers = await riskPoolTransferRepository.findByStoreStaffId(store_staff_id);
        } else {
            transfers = await riskPoolTransferRepository.findAll();
        }

        return successResponse(res, 200, 'Risk pool transfers retrieved successfully', transfers);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const searchRiskPoolStores = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        if (!product_id) {
            return errorResponse(res, 400, 'product_id is required', 'VAL100');
        }

        if (!quantity || quantity <= 0) {
            return errorResponse(res, 400, 'Valid quantity is required', 'VAL100');
        }

        const stores = await cookedQCService.searchRiskPoolStores(product_id, quantity);

        return successResponse(res, 200, 'Available stores retrieved successfully', stores);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const transferFromRiskPool = async (req, res) => {
    try {
        const { batch_id, product_id, quantity, from_store_staff_id, notes } = req.body;

        if (!batch_id) {
            return errorResponse(res, 400, 'batch_id is required', 'VAL100');
        }

        const batchExists = await cookedBatchRepository.findById(batch_id);
        if (!batchExists) {
            return errorResponse(res, 404, 'Batch not found', 'QC103');
        }

        if (!product_id) {
            return errorResponse(res, 400, 'product_id is required', 'VAL100');
        }

        if (!quantity || quantity <= 0) {
            return errorResponse(res, 400, 'Valid quantity is required', 'VAL100');
        }

        if (!from_store_staff_id) {
            return errorResponse(res, 400, 'from_store_staff_id is required', 'VAL100');
        }

        const storeStaffExists = await storeStaffRepository.findById(from_store_staff_id);
        if (!storeStaffExists) {
            return errorResponse(res, 404, 'Store staff not found', 'USER103');
        }

        const result = await cookedQCService.transferFromRiskPool(
            batch_id,
            product_id,
            quantity,
            from_store_staff_id,
            req.user.uid,
            notes
        );

        return successResponse(res, 200, result.message, result);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

module.exports = {
    getPendingProductQC,
    performProductQC,
    getStoreCredits,
    getRiskPoolTransfers,
    searchRiskPoolStores,
    transferFromRiskPool
};
