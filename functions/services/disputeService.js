const disputeRepository = require('../repositories/disputeRepository');
const orderRepository = require('../repositories/orderRepository');
const storeStaffRepository = require('../repositories/storeStaffRepository');
const productRepository = require('../repositories/productRepository');
const storeCreditRepository = require('../repositories/storeCreditRepository');
const storeInventoryRepository = require('../repositories/storeInventoryRepository');
const orderHistoryRepository = require('../repositories/orderHistoryRepository');
const { DISPUTE_TYPES, DISPUTE_FILING_WINDOW_HOURS, isValidDisputeType } = require('../constants/disputeTypes');

const fileDispute = async (orderId, items, reason, userId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    if (order.order_status_id !== 'OR104') {
        throw new Error('Can only dispute orders that have been delivered (OR104)');
    }

    const storeStaff = await storeStaffRepository.findByUserId(userId);
    if (!storeStaff || storeStaff.store_staff_id !== order.store_staff_id) {
        throw new Error('You can only dispute your own orders');
    }

    const orderHistory = await orderHistoryRepository.findByOrderId(orderId);
    const deliveredHistory = orderHistory.find(h => h.to_status_id === 'OR104');
    
    if (deliveredHistory) {
        const deliveredAt = new Date(deliveredHistory.created_at);
        const now = new Date();
        const hoursSinceDelivery = (now - deliveredAt) / (1000 * 60 * 60);
        
        if (hoursSinceDelivery > DISPUTE_FILING_WINDOW_HOURS) {
            throw new Error(`Dispute filing window expired. You must file disputes within ${DISPUTE_FILING_WINDOW_HOURS} hour(s) of delivery confirmation.`);
        }
    }

    const existingDisputes = await disputeRepository.findByOrderId(orderId);
    const productDisputedQuantities = {};

    for (const existingDispute of existingDisputes) {
        for (const disputedItem of existingDispute.items) {
            if (!productDisputedQuantities[disputedItem.product_id]) {
                productDisputedQuantities[disputedItem.product_id] = 0;
            }
            productDisputedQuantities[disputedItem.product_id] += disputedItem.disputed_quantity;
        }
    }

    for (const item of items) {
        if (!isValidDisputeType(item.issue_type)) {
            const validTypes = Object.values(DISPUTE_TYPES).map(dt => dt.type).join(', ');
            throw new Error(`Invalid issue_type '${item.issue_type}'. Must be one of: ${validTypes}`);
        }

        const orderItem = order.items.find(oi => oi.product_id === item.product_id);
        if (!orderItem) {
            throw new Error(`Product ${item.product_id} not found in order`);
        }

        const alreadyDisputed = productDisputedQuantities[item.product_id] || 0;
        const totalDisputed = alreadyDisputed + item.disputed_quantity;
        
        if (totalDisputed > orderItem.quantity) {
            throw new Error(`Total disputed quantity for ${item.product_id} (${totalDisputed}) exceeds ordered quantity (${orderItem.quantity}). Already disputed: ${alreadyDisputed}`);
        }
    }

    const dispute = await disputeRepository.create({
        order_id: orderId,
        store_staff_id: storeStaff.store_staff_id,
        items: items,
        reason: reason,
        status: 'PENDING'
    });

    return dispute;
};

const getDisputesByOrder = async (orderId, userId, userRole) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    if (userRole === 4) {
        const storeStaff = await storeStaffRepository.findByUserId(userId);
        if (!storeStaff || storeStaff.store_staff_id !== order.store_staff_id) {
            throw new Error('You can only view disputes for your own orders');
        }
    }

    return await disputeRepository.findByOrderId(orderId);
};

const getAllDisputes = async () => {
    return await disputeRepository.findAll();
};

const getMyDisputes = async (userId) => {
    const storeStaff = await storeStaffRepository.findByUserId(userId);
    if (!storeStaff) {
        throw new Error('Store staff not found');
    }
    
    return await disputeRepository.findByStoreStaff(storeStaff.store_staff_id);
};

const resolveDispute = async (disputeId, resolutionType, resolutionNotes, userId) => {
    const dispute = await disputeRepository.findById(disputeId);
    if (!dispute) {
        throw new Error('Dispute not found');
    }

    if (dispute.status === 'RESOLVED') {
        throw new Error('Dispute already resolved');
    }

    if (!['APPROVE', 'REJECT'].includes(resolutionType)) {
        throw new Error('resolution_type must be APPROVE or REJECT');
    }

    if (resolutionType === 'APPROVE') {
        const order = await orderRepository.findById(dispute.order_id);
        let totalCreditAmount = 0;

        for (const item of dispute.items) {
            const product = await productRepository.findById(item.product_id);
            if (product) {
                const creditAmount = product.price * item.disputed_quantity;
                totalCreditAmount += creditAmount;
            }

            const storeInventory = await storeInventoryRepository.findByStoreStaff(dispute.store_staff_id);
            const inventoryItem = storeInventory.find(inv => inv.product_id === item.product_id);

            if (inventoryItem) {
                if (inventoryItem.quantity < item.disputed_quantity) {
                    throw new Error(`Insufficient inventory for ${item.product_id}. Available: ${inventoryItem.quantity}, Disputed: ${item.disputed_quantity}`);
                }

                await storeInventoryRepository.deductQuantity(inventoryItem.inventory_id, item.disputed_quantity);
            }
        }

        if (totalCreditAmount > 0) {
            await storeCreditRepository.create({
                store_staff_id: dispute.store_staff_id,
                order_id: dispute.order_id,
                dispute_id: disputeId,
                amount: totalCreditAmount,
                reason: `Dispute approved: ${resolutionNotes}`,
                issued_by: userId
            });
        }
    }

    return await disputeRepository.updateStatus(disputeId, 'RESOLVED', userId, `${resolutionType}: ${resolutionNotes}`);
};

module.exports = {
    fileDispute,
    getDisputesByOrder,
    getAllDisputes,
    getMyDisputes,
    resolveDispute
};
