const disputeService = require('../services/disputeService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { DISPUTE_TYPES, isValidDisputeType } = require('../constants/disputeTypes');

const fileDispute = async (req, res) => {
    try {
        const { order_id, items, reason } = req.body;
        const userId = req.user.uid;

        if (!order_id) {
            return errorResponse(res, 400, 'order_id is required');
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return errorResponse(res, 400, 'Items array is required');
        }

        for (const item of items) {
            if (!item.product_id || !item.disputed_quantity || !item.issue_type) {
                return errorResponse(res, 400, 'Each item must have product_id, disputed_quantity, and issue_type');
            }
            
            if (!isValidDisputeType(item.issue_type)) {
                const validTypes = Object.values(DISPUTE_TYPES).map(dt => dt.type).join(', ');
                return errorResponse(res, 400, `issue_type must be one of: ${validTypes}`);
            }
        }

        if (!reason || typeof reason !== 'string') {
            return errorResponse(res, 400, 'Reason is required');
        }

        const dispute = await disputeService.fileDispute(order_id, items, reason, userId);

        return successResponse(res, 201, 'Dispute filed successfully', dispute);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getDisputesByOrder = async (req, res) => {
    try {
        const { order_id } = req.body;
        const userId = req.user.uid;
        const userRole = req.user.role_id;

        if (!order_id) {
            return errorResponse(res, 400, 'order_id is required');
        }

        const disputes = await disputeService.getDisputesByOrder(order_id, userId, userRole);

        return successResponse(res, 200, 'Disputes retrieved successfully', disputes);
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const getAllDisputes = async (req, res) => {
    try {
        const disputes = await disputeService.getAllDisputes();

        return successResponse(res, 200, 'All disputes retrieved successfully', disputes);
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const getMyDisputes = async (req, res) => {
    try {
        const userId = req.user.uid;
        const disputes = await disputeService.getMyDisputes(userId);

        return successResponse(res, 200, 'My disputes retrieved successfully', disputes);
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const resolveDispute = async (req, res) => {
    try {
        const { dispute_id, resolution_type, resolution_notes } = req.body;
        const userId = req.user.uid;

        if (!dispute_id) {
            return errorResponse(res, 400, 'dispute_id is required');
        }

        if (!resolution_type) {
            return errorResponse(res, 400, 'resolution_type is required (APPROVE or REJECT)');
        }

        if (!resolution_notes) {
            return errorResponse(res, 400, 'Resolution notes are required');
        }

        const dispute = await disputeService.resolveDispute(dispute_id, resolution_type, resolution_notes, userId);

        return successResponse(res, 200, 'Dispute resolved successfully', dispute);
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

module.exports = {
    fileDispute,
    getDisputesByOrder,
    getAllDisputes,
    getMyDisputes,
    resolveDispute
};
