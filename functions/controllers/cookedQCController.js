const cookedQCService = require('../services/cookedQCService');
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
        const { batch_id, qc_result, notes } = req.body;

        if (!batch_id) {
            return errorResponse(res, 400, 'batch_id is required', 'VAL100');
        }

        if (!['PASS', 'FAIL'].includes(qc_result)) {
            return errorResponse(res, 400, 'qc_result must be PASS or FAIL', 'VAL103');
        }

        const result = await cookedQCService.performProductQC(
            batch_id,
            qc_result,
            req.user.uid,
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

        const result = await cookedQCService.getStoreCredits(store_staff_id);
        if (result?.error) {
            return errorResponse(res, result.statusCode, result.error, result.statusId);
        }

        return successResponse(res, 200, 'Store credits retrieved successfully', {
            credits: result.credits,
            total_credits: result.total_credits
        });
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getRiskPoolTransfers = async (req, res) => {
    try {
        const { order_id, store_staff_id } = req.body;

        const transfers = await cookedQCService.getRiskPoolTransfers({ order_id, store_staff_id });
        if (transfers?.error) {
            return errorResponse(res, transfers.statusCode, transfers.error, transfers.statusId);
        }

        return successResponse(res, 200, 'Risk pool transfers retrieved successfully', transfers);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const searchRiskPoolStores = async (req, res) => {
    try {
        const { batch_id, exclude_store_staff_id } = req.body;

        console.log('Searching risk pool stores with batch_id:', batch_id, 'and exclude_store_staff_id:', exclude_store_staff_id);

        if (!batch_id) {
            return errorResponse(res, 400, 'batch_id is required', 'VAL100');
        }

        const stores = await cookedQCService.searchRiskPoolStores(batch_id, exclude_store_staff_id);

        return successResponse(res, 200, 'Available stores retrieved successfully', stores);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const transferFromRiskPool = async (req, res) => {
    try {
        const { batch_id, from_store_staff_id, notes } = req.body;

        if (!batch_id) {
            return errorResponse(res, 400, 'batch_id is required', 'VAL100');
        }

        if (!from_store_staff_id) {
            return errorResponse(res, 400, 'from_store_staff_id is required', 'VAL100');
        }

        const result = await cookedQCService.transferFromRiskPool(
            batch_id,
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
