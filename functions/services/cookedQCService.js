const cookedQCRepository = require('../repositories/cookedQCRepository');
const orderRepository = require('../repositories/orderRepository');
const orderHistoryRepository = require('../repositories/orderHistoryRepository');
const storeInventoryRepository = require('../repositories/storeInventoryRepository');
const riskPoolTransferRepository = require('../repositories/riskPoolTransferRepository');
const storeCreditRepository = require('../repositories/storeCreditRepository');
const productRepository = require('../repositories/productRepository');
const cookedBatchRepository = require('../repositories/cookedBatchRepository');
const storeStaffRepository = require('../repositories/storeStaffRepository');

const CREDIT_RATE = 1;

const performProductQC = async (batchId, qcResult, userId, notes = '') => {
    try {
        const batch = await cookedBatchRepository.findById(batchId);
        
        if (!batch) {
            throw new Error('Cooked batch not found');
        }

        if (batch.qc_status !== 'PENDING') {
            throw new Error(`Batch already QC'd with status: ${batch.qc_status}`);
        }

        const order = await orderRepository.findById(batch.order_id);
        if (!order) {
            throw new Error('Order not found for this batch');
        }

        if (order.order_status_id !== 'OR102') {
            throw new Error(`Order must be in STAGED status. Current status: ${order.order_status_id}`);
        }

        const qcDate = new Date().toISOString();

        if (qcResult === 'PASS') {
            await cookedBatchRepository.update(batchId, {
                qc_status: 'PASS',
                qc_by: userId,
                qc_date: qcDate,
                qc_notes: notes || 'Product quality check passed'
            });

            await cookedQCRepository.create({
                batch_id: batchId,
                order_id: order.order_id,
                qc_status: 'PASS',
                qc_by: userId,
                qc_date: qcDate,
                notes: notes || 'Product quality check passed',
            });

            return {
                success: true,
                message: `Batch ${batch.batch_number}/${batch.total_batches} passed QC`,
                batch_id: batchId,
                order_id: order.order_id,
                batch_number: batch.batch_number,
                total_batches: batch.total_batches,
                qc_status: 'PASS'
            };
        } else if (qcResult === 'FAIL') {

            await cookedBatchRepository.update(batchId, {
                qc_status: 'FAIL',
                qc_by: userId,
                qc_date: qcDate,
                qc_notes: notes || 'Product quality check failed'
            });

            await cookedQCRepository.create({
                batch_id: batchId,
                order_id: order.order_id,
                qc_status: 'FAIL',
                qc_by: userId,
                qc_date: qcDate,
                notes: notes || 'Product quality check failed',
            });

            return {
                success: true,
                message: `Batch ${batch.batch_number}/${batch.total_batches} failed QC - Manual risk pool transfer required`,
                batch_id: batchId,
                order_id: order.order_id,
                batch_number: batch.batch_number,
                total_batches: batch.total_batches,
                qc_status: 'FAIL'
            };
        } else {
            throw new Error('Invalid QC result. Must be PASS or FAIL');
        }
    } catch (error) {
        throw new Error(`Error performing product QC: ${error.message}`);
    }
};

const getPendingProductQC = async () => {
    try {
        const pendingBatches = await cookedBatchRepository.findByQCStatus('PENDING');
        
        const enrichedBatches = [];
        for (const batch of pendingBatches) {
            const order = await orderRepository.findById(batch.order_id);
            enrichedBatches.push({
                ...batch,
                order_details: order
            });
        }
        
        return enrichedBatches;
    } catch (error) {
        throw new Error(`Error fetching pending product QC: ${error.message}`);
    }
};

const getStoreCredits = async (storeStaffId) => {
    const storeStaffExists = await storeStaffRepository.findById(storeStaffId);
    if (!storeStaffExists) {
        return { error: 'Store staff not found', statusCode: 404, statusId: 'USER103' };
    }

    const credits = await storeCreditRepository.findByStoreStaffId(storeStaffId);
    const totalCredits = await storeCreditRepository.getTotalCredits(storeStaffId);

    return {
        credits,
        total_credits: totalCredits
    };
};

const getRiskPoolTransfers = async ({ order_id, store_staff_id }) => {
    if (order_id) {
        const orderExists = await orderRepository.findById(order_id);
        if (!orderExists) {
            return { error: 'Order not found', statusCode: 404, statusId: 'DB101' };
        }
    }

    if (store_staff_id) {
        const storeStaffExists = await storeStaffRepository.findById(store_staff_id);
        if (!storeStaffExists) {
            return { error: 'Store staff not found', statusCode: 404, statusId: 'USER103' };
        }
    }

    if (order_id) {
        return riskPoolTransferRepository.findByOrderId(order_id);
    }

    if (store_staff_id) {
        return riskPoolTransferRepository.findByStoreStaffId(store_staff_id);
    }

    return riskPoolTransferRepository.findAll();
};

const searchRiskPoolStores = async (batchId, excludeStoreStaffId) => {
    try {
        const batch = await cookedBatchRepository.findById(batchId);
        if (!batch) {
            throw new Error('Cooked batch not found');
        }

        if (batch.qc_status !== 'FAIL') {
            throw new Error('Can only search risk pool for failed batches');
        }

        if (!batch.items || batch.items.length === 0) {
            throw new Error('Failed batch has no items');
        }

        const failedItem = batch.items[0];
        const productId = failedItem.product_id;
        const quantity = failedItem.quantity;

        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const availableStores = await storeInventoryRepository.findAvailableByProduct(productId, quantity, excludeStoreStaffId);

        return availableStores.map(store => ({
            store_staff_id: store.store_staff_id,
            inventory_id: store.inventory_id,
            product_id: productId,
            product_name: product.product_name,
            available_quantity: store.quantity,
            quantity_needed: quantity,
            can_fulfill: store.quantity >= quantity,
            expiration_date: store.expiration_date,
            potential_credit: (product.price || 0) * quantity * CREDIT_RATE
        }));
    } catch (error) {
        throw new Error(`Error searching risk pool stores: ${error.message}`);
    }
};

const transferFromRiskPool = async (batchId, fromStoreStaffId, userId, notes = '') => {
    try {
        const batch = await cookedBatchRepository.findById(batchId);
        if (!batch) {
            throw new Error('Cooked batch not found');
        }

        if (batch.qc_status !== 'FAIL') {
            throw new Error('Can only transfer from risk pool for failed batches');
        }

        if (!batch.items || batch.items.length === 0) {
            throw new Error('Failed batch has no items');
        }

        const failedItem = batch.items[0];
        const productId = failedItem.product_id;
        const quantity = failedItem.quantity;

        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const storeInventory = await storeInventoryRepository.findByStoreStaff(fromStoreStaffId);
        const inventoryItem = storeInventory.find(inv => inv.product_id === productId);

        if (!inventoryItem) {
            throw new Error('Store does not have this product in inventory');
        }

        if (inventoryItem.quantity < quantity) {
            throw new Error(`Insufficient quantity. Available: ${inventoryItem.quantity}, Requested: ${quantity}`);
        }

        await storeInventoryRepository.deductQuantity(inventoryItem.inventory_id, quantity);

        const creditAmount = (product.price || 0) * quantity * CREDIT_RATE;

        const transferDate = new Date().toISOString();
        const transferRecord = await riskPoolTransferRepository.create({
            batch_id: batchId,
            order_id: batch.order_id,
            product_id: productId,
            quantity: quantity,
            from_store_staff_id: fromStoreStaffId,
            transfer_date: transferDate,
            reason: notes || 'Manual risk pool transfer for failed batch',
            credit_awarded: creditAmount,
            transferred_by: userId
        });

        await storeCreditRepository.create({
            store_staff_id: fromStoreStaffId,
            amount: creditAmount,
            source: 'RISK_POOL',
            batch_id: batchId,
            order_id: batch.order_id,
            product_id: productId,
            quantity: quantity,
            notes: `Risk pool transfer for batch ${batchId} - ${product.product_name}`
        });

        await cookedBatchRepository.update(batchId, {
            qc_status: 'REPLACED',
            replacement_completed_at: transferDate,
            replacement_from_store: fromStoreStaffId
        });

        const order = await orderRepository.findById(batch.order_id);
        const allBatches = await cookedBatchRepository.findByOrderId(batch.order_id);
        const nextBatchNumber = allBatches.length + 1;

        const replacementItems = [{
            product_id: productId,
            product_name: product.product_name,
            quantity: quantity,
            weight_per_unit: product.weight_per_unit || 0,
            total_weight: (product.weight_per_unit || 0) * quantity
        }];

        const replacementWeight = (product.weight_per_unit || 0) * quantity;

        await cookedBatchRepository.create({
            order_id: batch.order_id,
            store_id: order.store_staff_id,
            batch_number: nextBatchNumber,
            total_batches: batch.total_batches,
            items: replacementItems,
            total_weight: replacementWeight,
            qc_status: 'PENDING',
            replaced: true,
            source: transferRecord.transfer_id,
            cooked_by: userId,
            cooked_at: transferDate
        });

        return {
            success: true,
            message: 'Risk pool transfer completed, credit awarded, and replacement batch created for QC',
            batch_id: batchId,
            order_id: batch.order_id,
            product_id: productId,
            product_name: product.product_name,
            quantity: quantity,
            from_store_staff_id: fromStoreStaffId,
            credit_awarded: creditAmount,
            replacement_batch_created: true
        };
    } catch (error) {
        throw new Error(`Error transferring from risk pool: ${error.message}`);
    }
};

module.exports = {
    performProductQC,
    getPendingProductQC,
    getStoreCredits,
    getRiskPoolTransfers,
    searchRiskPoolStores,
    transferFromRiskPool
};
