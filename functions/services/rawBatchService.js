const rawBatchRepository = require('../repositories/rawBatchRepository');
const batchConsumptionRepository = require('../repositories/batchConsumptionRepository');
const supplierRepository = require('../repositories/supplierRepository');
const orderRepository = require('../repositories/orderRepository');

const getAllBatches = async (qcStatus, batchDate) => {
    if (qcStatus && batchDate) {
        return rawBatchRepository.findByQCStatusAndDate(qcStatus, batchDate);
    }

    return rawBatchRepository.findAll();
};

const getOneBatch = async (batchId) => {
    const batch = await rawBatchRepository.findById(batchId);
    if (!batch) {
        return null;
    }

    const replacedBatch = batch.replaced_batch_id
        ? await rawBatchRepository.findById(batch.replaced_batch_id)
        : null;

    const replacementBatches = await rawBatchRepository.findReplacementBatches(batchId);

    return {
        batch,
        replaced_batch: replacedBatch,
        replacement_batches: replacementBatches
    };
};

const getBatchConsumption = async ({ order_id, material_id, start_date, end_date }) => {
    if (order_id) {
        const orderExists = await orderRepository.findById(order_id);
        if (!orderExists) {
            return { error: 'Order not found', statusCode: 404, statusId: 'DB101' };
        }

        return batchConsumptionRepository.findByOrderId(order_id);
    }

    if (material_id) {
        return batchConsumptionRepository.findByMaterialId(material_id);
    }

    if (start_date && end_date) {
        return batchConsumptionRepository.findByDateRange(start_date, end_date);
    }

    return batchConsumptionRepository.findAll();
};

const getBatchesBySupplier = async (supplierId) => {
    const supplierExists = await supplierRepository.findById(supplierId);
    if (!supplierExists) {
        return { error: 'Supplier not found', statusCode: 404, statusId: 'DB101' };
    }

    return rawBatchRepository.findBySupplierId(supplierId);
};

module.exports = {
    getAllBatches,
    getOneBatch,
    getBatchConsumption,
    getBatchesBySupplier
};
