const rawQCService = require('../services/rawQCService');
const rawBatchRepository = require('../repositories/rawBatchRepository');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getPendingQC = async (req, res) => {
    try {
        const pendingSupplies = await rawQCService.getPendingQC();
        return successResponse(res, 200, 'Pending raw material QC retrieved successfully', pendingSupplies, 'QC102');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const performQC = async (req, res) => {
    try {
        const { batch_id, qc_result, notes } = req.body;

        if (!batch_id) {
            return errorResponse(res, 400, 'batch_id is required', 'VAL100');
        }

        const batchExists = await rawBatchRepository.findById(batch_id);
        if (!batchExists) {
            return errorResponse(res, 404, 'Batch not found', 'QC103');
        }

        if (!['PASS', 'FAIL'].includes(qc_result)) {
            return errorResponse(res, 400, 'QC result must be PASS or FAIL', 'VAL103');
        }

        const result = await rawQCService.performQC(
            batch_id,
            qc_result,
            req.user.uid,
            notes
        );

        const statusCode = qc_result === 'PASS' ? 'QC100' : 'QC101';
        return successResponse(res, 200, result.message, result, statusCode);
    } catch (error) {
        const statusId = error.message.includes('not found') ? 'QC103' : 'SYS100';
        return errorResponse(res, 500, error.message, statusId);
    }
};

module.exports = {
    getPendingQC,
    performQC
};
