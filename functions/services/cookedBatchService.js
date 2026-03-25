const cookedBatchRepository = require('../repositories/cookedBatchRepository');
const orderRepository = require('../repositories/orderRepository');

const getAllCookedBatches = async (qcStatus, cookDate) => {
    if (qcStatus && cookDate) {
        return cookedBatchRepository.findByQCStatusAndDate(qcStatus, cookDate);
    }

    return cookedBatchRepository.findAll();
};

const getCookedBatchById = async (batchId) => {
    return cookedBatchRepository.findById(batchId);
};

const getCookedBatchesByOrder = async (orderId) => {
    const orderExists = await orderRepository.findById(orderId);
    if (!orderExists) {
        return { error: 'Order not found', statusCode: 404, statusId: 'DB101' };
    }

    const batches = await cookedBatchRepository.findByOrderId(orderId);
    if (!batches || batches.length === 0) {
        return { error: 'No cooked batches found for this order', statusCode: 404, statusId: 'BAT103' };
    }

    return batches;
};

const getCookedBatchesByStore = async (storeId) => {
    return cookedBatchRepository.findByStoreId(storeId);
};

module.exports = {
    getAllCookedBatches,
    getCookedBatchById,
    getCookedBatchesByOrder,
    getCookedBatchesByStore
};
