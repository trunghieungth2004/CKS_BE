const orderService = require('../services/orderService');
const { validateCreateOrder, validateUpdateOrderStatus } = require('../validators/orderValidator');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const createOrder = async (req, res) => {
    try {
        const orderData = req.body;

        const { error, value } = validateCreateOrder(orderData);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const result = await orderService.createOrder(value, req.user.user_id);

        return successResponse(res, 201, "Order created successfully", result, 'OR100');
    } catch (error) {
        console.error("Error creating order:", error);
        const statusId = error.message.includes('cut-off time') ? 'SYS101' : 'SYS100';
        const statusCode = error.message.includes('cut-off time') ? 400 : 500;
        return errorResponse(res, statusCode, error.message, statusId);
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { order_id, order_status_id } = req.body;

        const { error } = validateUpdateOrderStatus({ order_id, order_status_id });
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const result = await orderService.updateOrderStatus(order_id, order_status_id, req.user.role_id, req.user.user_id);

        return successResponse(res, 200, "Order status updated successfully", result, order_status_id);
    } catch (error) {
        console.error("Error updating order status:", error);
        return errorResponse(res, 403, error.message);
    }
};

const getOrder = async (req, res) => {
    try {
        const { order_id } = req.body;

        if (!order_id) {
            return errorResponse(res, 400, "Order ID is required", 'VAL100');
        }

        const result = await orderService.getOrderById(order_id);

        return successResponse(res, 200, "Order retrieved successfully", result, result.order_status_id);
    } catch (error) {
        console.error("Error retrieving order:", error);
        const statusId = error.message.includes('not found') ? 'DB101' : 'SYS100';
        return errorResponse(res, 404, error.message, statusId);
    }
};

const getMyOrders = async (req, res) => {
    try {
        const { order_status_id } = req.body;

        if (!order_status_id) {
            return errorResponse(res, 400, "Order status ID is required", 'VAL100');
        }
        
        const result = await orderService.getOrdersByStoreStaff(req.user.user_id, order_status_id);

        return successResponse(res, 200, "Orders retrieved successfully", result);
    } catch (error) {
        console.error("Error retrieving orders:", error);
        return errorResponse(res, 500, error.message);
    }
};

const getAllOrders = async (req, res) => {
    try {
        const result = await orderService.getAllOrders();

        return successResponse(res, 200, "All orders retrieved successfully", result);
    } catch (error) {
        console.error("Error retrieving all orders:", error);
        return errorResponse(res, 500, error.message);
    }
};

module.exports = {
    createOrder,
    updateOrderStatus,
    getOrder,
    getMyOrders,
    getAllOrders
};
