const cookedQCRepository = require('../repositories/cookedQCRepository');
const orderRepository = require('../repositories/orderRepository');
const orderHistoryRepository = require('../repositories/orderHistoryRepository');
const storeInventoryRepository = require('../repositories/storeInventoryRepository');
const riskPoolTransferRepository = require('../repositories/riskPoolTransferRepository');
const storeCreditRepository = require('../repositories/storeCreditRepository');
const productRepository = require('../repositories/productRepository');
const cookedBatchRepository = require('../repositories/cookedBatchRepository');

const CREDIT_RATE = 1;

const performProductQC = async (batchId, qcResult, userId, failedItems = [], notes = '') => {
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
                failed_items: []
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
            if (!failedItems || failedItems.length === 0) {
                throw new Error('failed_items is required when QC fails');
            }

            await cookedBatchRepository.update(batchId, {
                qc_status: 'FAIL',
                qc_by: userId,
                qc_date: qcDate,
                qc_notes: notes || 'Product quality check failed',
                failed_items: failedItems
            });

            await cookedQCRepository.create({
                batch_id: batchId,
                order_id: order.order_id,
                qc_status: 'FAIL',
                qc_by: userId,
                qc_date: qcDate,
                notes: notes || 'Product quality check failed',
                failed_items: failedItems
            });

            return {
                success: true,
                message: `Batch ${batch.batch_number}/${batch.total_batches} failed QC - Manual risk pool transfer required`,
                batch_id: batchId,
                order_id: order.order_id,
                batch_number: batch.batch_number,
                total_batches: batch.total_batches,
                qc_status: 'FAIL',
                failed_items: failedItems
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

const searchRiskPoolStores = async (productId, quantity) => {
    try {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const availableStores = await storeInventoryRepository.findAvailableByProduct(productId, quantity);

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

const transferFromRiskPool = async (batchId, productId, quantity, fromStoreStaffId, userId, notes = '') => {
    try {
        const batch = await cookedBatchRepository.findById(batchId);
        if (!batch) {
            throw new Error('Cooked batch not found');
        }

        if (batch.qc_status !== 'FAIL') {
            throw new Error('Can only transfer from risk pool for failed batches');
        }

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
        await riskPoolTransferRepository.create({
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

        return {
            success: true,
            message: 'Risk pool transfer completed and credit awarded',
            batch_id: batchId,
            order_id: batch.order_id,
            product_id: productId,
            product_name: product.product_name,
            quantity: quantity,
            from_store_staff_id: fromStoreStaffId,
            credit_awarded: creditAmount
        };
    } catch (error) {
        throw new Error(`Error transferring from risk pool: ${error.message}`);
    }
};

module.exports = {
    performProductQC,
    getPendingProductQC,
    searchRiskPoolStores,
    transferFromRiskPool
};
