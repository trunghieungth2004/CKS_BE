const rawMaterialSupplyRepository = require('../repositories/rawMaterialSupplyRepository');
const ckInventoryRepository = require('../repositories/ckInventoryRepository');
const wasteLogRepository = require('../repositories/wasteLogRepository');
const orderRepository = require('../repositories/orderRepository');
const orderHistoryRepository = require('../repositories/orderHistoryRepository');
const rawBatchRepository = require('../repositories/rawBatchRepository');
const supplierRepository = require('../repositories/supplierRepository');

const MAX_BATCH_SIZE = 5;

const performQC = async (batchId, qcResult, userId, notes = '') => {
    try {
        const batch = await rawBatchRepository.findById(batchId);
        
        if (!batch) {
            throw new Error('Production batch not found');
        }

        if (batch.qc_status !== 'PENDING') {
            throw new Error(`Batch already processed with status: ${batch.qc_status}`);
        }

        const qcDate = new Date().toISOString();

        if (qcResult === 'PASS') {
            await rawBatchRepository.update(batchId, {
                qc_status: 'PASS',
                qc_by: userId,
                qc_date: qcDate,
                notes: notes || 'Quality check passed'
            });

            await ckInventoryRepository.updateQuantity(batch.material_id, batch.quantity);

            const today = new Date().toISOString().split('T')[0];
            const allPendingOrders = await orderRepository.findByStatus('OR100');
            const todayOrders = allPendingOrders.filter(order => {
                const orderDate = order.created_at.split('T')[0];
                return orderDate === today;
            });

            const allBatches = await rawBatchRepository.findByDate(today);
            const hasPendingBatches = allBatches.some(b => b.qc_status === 'PENDING');
            const allBatchesComplete = !hasPendingBatches;

            let ordersUpdated = 0;
            if (allBatchesComplete) {
                for (const order of todayOrders) {
                    await orderRepository.update(order.order_id, {
                        order_status_id: 'OR101'
                    });
                    
                    await orderHistoryRepository.create({
                        order_id: order.order_id,
                        from_status_id: 'OR100',
                        to_status_id: 'OR101',
                        changed_by_user_id: userId,
                        changed_by_role_id: 1,
                        notes: `All production batches passed QC - materials available for production`
                    });
                    
                    ordersUpdated++;
                }
            }

            return {
                success: true,
                message: allBatchesComplete 
                    ? `QC passed - Material added to CK inventory. All batches approved! ${ordersUpdated} orders updated to OR101 (CONFIRMED)`
                    : `QC passed - Material added to CK inventory. Waiting for other batches to complete QC.`,
                batch_id: batchId,
                batch_number: batch.batch_number,
                material_id: batch.material_id,
                quantity: batch.quantity,
                orders_updated: ordersUpdated,
                all_batches_approved: allBatchesComplete
            };
        } else if (qcResult === 'FAIL') {
            await rawBatchRepository.update(batchId, {
                qc_status: 'FAIL',
                qc_by: userId,
                qc_date: qcDate,
                notes: notes || 'Quality check failed'
            });

            await wasteLogRepository.create({
                material_id: batch.material_id,
                material_name: batch.material_name,
                quantity: batch.quantity,
                unit: batch.unit,
                waste_date: qcDate.split('T')[0],
                reason: notes || 'Failed QC - Production batch rejected',
                logged_by: userId,
                batch_id: batchId
            });

            const allSuppliers = await supplierRepository.findAll();
            if (!allSuppliers || allSuppliers.length === 0) {
                throw new Error('No suppliers available for replacement batch');
            }

            const availableSuppliers = allSuppliers.filter(s => s.supplier_id !== batch.supplier_id);
            const replacementSupplier = availableSuppliers.length > 0 
                ? availableSuppliers[Math.floor(Math.random() * availableSuppliers.length)]
                : allSuppliers[Math.floor(Math.random() * allSuppliers.length)];

            const today = new Date().toISOString().split('T')[0];
            
            const replacementSupply = await rawMaterialSupplyRepository.create({
                material_id: batch.material_id,
                material_name: batch.material_name,
                supplier_id: replacementSupplier.supplier_id,
                supplier_name: replacementSupplier.supplier_name,
                base_quantity: batch.quantity,
                buffer_quantity: 0,
                total_quantity: batch.quantity,
                unit: batch.unit,
                supply_date: today,
                notes: `Replacement for failed batch ${batch.batch_number}. Original supplier: ${batch.supplier_name}`
            });

            const replacementBatches = [];
            const numBatches = Math.ceil(batch.quantity / MAX_BATCH_SIZE);
            let remainingQuantity = batch.quantity;

            for (let i = 0; i < numBatches; i++) {
                const batchQuantity = Math.min(MAX_BATCH_SIZE, remainingQuantity);
                
                const replacementBatch = await rawBatchRepository.create({
                    supply_id: replacementSupply.supply_id,
                    material_id: batch.material_id,
                    material_name: batch.material_name,
                    batch_number: `BATCH-${today}-${replacementSupply.supply_id.slice(-6)}-R${i + 1}`,
                    quantity: batchQuantity,
                    unit: batch.unit,
                    batch_date: today,
                    qc_status: 'PENDING',
                    qc_by: null,
                    qc_date: null,
                    supplier_id: replacementSupplier.supplier_id,
                    supplier_name: replacementSupplier.supplier_name,
                    replaced_batch_id: batchId
                });
                
                replacementBatches.push(replacementBatch);
                remainingQuantity -= batchQuantity;
            }

            return {
                success: true,
                message: `QC failed - Material logged as waste. ${replacementBatches.length} replacement batch(es) automatically created from ${replacementSupplier.supplier_name}.`,
                batch_id: batchId,
                batch_number: batch.batch_number,
                material_id: batch.material_id,
                quantity: batch.quantity,
                waste_logged: true,
                replacement_batches: replacementBatches.map(b => ({
                    batch_id: b.batch_id,
                    batch_number: b.batch_number,
                    supplier_name: replacementSupplier.supplier_name,
                    quantity: b.quantity
                })),
                orders_updated: 0
            };
        } else {
            throw new Error('Invalid QC result. Must be PASS or FAIL');
        }
    } catch (error) {
        throw new Error(`Error performing QC: ${error.message}`);
    }
};

const getPendingQC = async () => {
    try {
        const pendingBatches = await rawBatchRepository.findPendingQC();
        return pendingBatches;
    } catch (error) {
        throw new Error(`Error fetching pending QC: ${error.message}`);
    }
};

module.exports = {
    performQC,
    getPendingQC
};
