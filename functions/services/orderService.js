const orderRepository = require('../repositories/orderRepository');
const storeStaffRepository = require('../repositories/storeStaffRepository');
const productRepository = require('../repositories/productRepository');
const orderHistoryRepository = require('../repositories/orderHistoryRepository');
const recipeRepository = require('../repositories/recipeRepository');
const recipeIngredientRepository = require('../repositories/recipeIngredientRepository');
const ckInventoryRepository = require('../repositories/ckInventoryRepository');
const batchConsumptionRepository = require('../repositories/batchConsumptionRepository');
const storeInventoryRepository = require('../repositories/storeInventoryRepository');
const cookedBatchRepository = require('../repositories/cookedBatchRepository');
const { getOrderStatus, isValidTransition, isTerminalStatus } = require('../constants/statuses');

const CUTOFF_HOUR = 18;

const checkCutoffTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour < CUTOFF_HOUR;
};

const createOrder = async (orderData, userId) => {
    const { store_staff_id, delivery_date, items, notes } = orderData;

    const storeStaff = await storeStaffRepository.findByUserId(userId);
    if (!storeStaff) {
        throw new Error('Store staff record not found for this user');
    }

    if (store_staff_id && store_staff_id !== storeStaff.store_staff_id) {
        throw new Error('Store staff ID does not match authenticated user');
    }

    if (!delivery_date) {
        throw new Error('Delivery date is required');
    }

    if (!items || items.length === 0) {
        throw new Error('Order must contain at least one item');
    }

    for (const item of items) {
        const product = await productRepository.findById(item.product_id);
        if (!product) {
            throw new Error(`Product with ID '${item.product_id}' not found`);
        }
    }

    const deliveryDateObj = new Date(delivery_date);
    if (isNaN(deliveryDateObj.getTime())) {
        throw new Error('Invalid delivery date format');
    }

    const beforeCutoff = checkCutoffTime();
    const initialStatusId = beforeCutoff ? 'OR100' : 'OR105';
    
    if (!beforeCutoff) {
        throw new Error('Order submission past cut-off time (6 PM). Order automatically cancelled.');
    }

    const order = {
        store_staff_id: storeStaff.store_staff_id,
        order_status_id: initialStatusId,
        delivery_date: deliveryDateObj.toISOString(),
        items: items,
        notes: notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const createdOrder = await orderRepository.create(order);

    await orderHistoryRepository.create({
        order_id: createdOrder.order_id,
        from_status_id: null,
        to_status_id: initialStatusId,
        changed_by_user_id: userId,
        changed_by_role_id: 4,
        notes: 'Order created'
    });

    const status = getOrderStatus(initialStatusId);

    return {
        ...createdOrder,
        status_name: status?.status_name || 'PENDING'
    };
};

const updateOrderStatus = async (orderId, newStatusId, userRole, userId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    if (isTerminalStatus(order.order_status_id)) {
        throw new Error('Cannot update order that is already delivered or cancelled');
    }

    const currentStatus = getOrderStatus(order.order_status_id);
    const newStatus = getOrderStatus(newStatusId);

    if (!newStatus) {
        throw new Error('Invalid status ID');
    }

    if (!isValidTransition(order.order_status_id, newStatusId)) {
        throw new Error(`Invalid status transition from ${currentStatus.status_name} to ${newStatus.status_name}`);
    }

    if (userRole === 1 && order.order_status_id === 'OR101' && newStatusId === 'OR102') {
        const materialsUsed = {};
        
        for (const item of order.items) {
            const recipe = await recipeRepository.findByProductId(item.product_id);
            if (!recipe) {
                throw new Error(`Recipe not found for product ${item.product_id}`);
            }
            
            const ingredients = await recipeIngredientRepository.findByRecipeId(recipe.recipe_id);
            
            for (const ingredient of ingredients) {
                const quantityNeeded = ingredient.quantity_per_unit * item.quantity;
                
                if (!materialsUsed[ingredient.material_id]) {
                    materialsUsed[ingredient.material_id] = {
                        material_id: ingredient.material_id,
                        material_name: ingredient.material_name,
                        quantity: 0,
                        unit: ingredient.unit || 'kg'
                    };
                }
                
                materialsUsed[ingredient.material_id].quantity += quantityNeeded;
            }
        }
        
        for (const materialId in materialsUsed) {
            const material = materialsUsed[materialId];
            await ckInventoryRepository.deductQuantity(material.material_id, material.quantity);
            
            await batchConsumptionRepository.create({
                order_id: orderId,
                material_id: material.material_id,
                material_name: material.material_name,
                quantity: material.quantity,
                unit: material.unit,
                consumed_by: userId,
                consumed_at: new Date().toISOString()
            });
        }


        const MAX_COOKED_BATCH_SIZE = 5;
        let totalWeight = 0;
        const itemsWithWeight = [];

        for (const item of order.items) {
            const product = await productRepository.findById(item.product_id);
            const itemWeight = (product.weight_per_unit || 0.5) * item.quantity;
            totalWeight += itemWeight;
            itemsWithWeight.push({
                product_id: item.product_id,
                product_name: product.product_name,
                quantity: item.quantity,
                weight_per_unit: product.weight_per_unit || 0.5,
                total_weight: itemWeight
            });
        }

        const numBatches = Math.ceil(totalWeight / MAX_COOKED_BATCH_SIZE);
        let currentBatchWeight = 0;
        let currentBatchItems = [];
        let batchNumber = 1;

        for (const item of itemsWithWeight) {
            if (currentBatchWeight + item.total_weight > MAX_COOKED_BATCH_SIZE && currentBatchItems.length > 0) {
                await cookedBatchRepository.create({
                    order_id: orderId,
                    store_id: order.store_staff_id,
                    batch_number: batchNumber,
                    total_batches: numBatches,
                    items: currentBatchItems,
                    total_weight: currentBatchWeight,
                    qc_status: 'PENDING',
                    cooked_by: userId,
                    cooked_at: new Date().toISOString()
                });
                
                batchNumber++;
                currentBatchItems = [];
                currentBatchWeight = 0;
            }

            currentBatchItems.push({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                weight_per_unit: item.weight_per_unit,
                total_weight: item.total_weight
            });
            currentBatchWeight += item.total_weight;
        }

        if (currentBatchItems.length > 0) {
            await cookedBatchRepository.create({
                order_id: orderId,
                store_id: order.store_staff_id,
                batch_number: batchNumber,
                total_batches: numBatches,
                items: currentBatchItems,
                total_weight: currentBatchWeight,
                qc_status: 'PENDING',
                cooked_by: userId,
                cooked_at: new Date().toISOString()
            });
        }
    } else if (userRole === 2 && order.order_status_id === 'OR102' && newStatusId === 'OR103') {
        const allBatches = await cookedBatchRepository.findByOrderId(orderId);
        
        if (!allBatches || allBatches.length === 0) {
            throw new Error('No cooked batches found for this order');
        }

        const pendingBatches = allBatches.filter(b => b.qc_status === 'PENDING');
        if (pendingBatches.length > 0) {
            throw new Error(`Cannot dispatch: ${pendingBatches.length} batch(es) still pending QC`);
        }

    } else if (userRole === 4 && order.order_status_id === 'OR103' && newStatusId === 'OR104') {
        const storeStaff = await storeStaffRepository.findByUserId(userId);
        if (!storeStaff || storeStaff.store_staff_id !== order.store_staff_id) {
            throw new Error('You can only confirm delivery for your own orders');
        }
        
        const deliveryDate = new Date();
        
        for (const item of order.items) {
            const product = await productRepository.findById(item.product_id);
            const shelfLifeDays = product.shelf_life_days || 5;
            const expirationDate = new Date(deliveryDate);
            expirationDate.setDate(expirationDate.getDate() + shelfLifeDays);
            
            const storeInventory = await storeInventoryRepository.findByStoreStaff(order.store_staff_id);
            const existingItem = storeInventory.find(inv => inv.product_id === item.product_id);
            
            if (existingItem) {
                await storeInventoryRepository.update(existingItem.inventory_id, {
                    quantity: (existingItem.quantity || 0) + item.quantity,
                    last_updated: deliveryDate.toISOString(),
                    expiration_date: expirationDate.toISOString()
                });
            } else {
                await storeInventoryRepository.create({
                    store_staff_id: order.store_staff_id,
                    product_id: item.product_id,
                    product_name: product.product_name,
                    quantity: item.quantity,
                    expiration_date: expirationDate.toISOString(),
                    last_updated: deliveryDate.toISOString()
                });
            }
        }

    } else if (userRole === 4 && newStatusId === 'OR105') {
        const storeStaff = await storeStaffRepository.findByUserId(userId);
        if (!storeStaff || storeStaff.store_staff_id !== order.store_staff_id) {
            throw new Error('You can only cancel your own orders');
        }
        
        if (order.order_status_id === 'OR100') {
            const now = new Date();
            const currentHour = now.getHours();
            if (currentHour >= 18) {
                throw new Error('Store staff can only cancel pending orders before 6 PM');
            }
        }

    } else if (userRole === 0) {

    } else {
        throw new Error(`Role ${userRole} not authorized to update order status from ${currentStatus.status_name} to ${newStatus.status_name}`);
    }

    const updatedOrder = await orderRepository.update(orderId, {
        order_status_id: newStatusId,
        updated_at: new Date().toISOString()
    });

    await orderHistoryRepository.create({
        order_id: orderId,
        from_status_id: order.order_status_id,
        to_status_id: newStatusId,
        changed_by_user_id: userId,
        changed_by_role_id: userRole,
        notes: `Status changed from ${currentStatus.status_name} to ${newStatus.status_name}`
    });

    return {
        ...updatedOrder,
        status_name: newStatus.status_name
    };
};

const getOrderById = async (orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
        throw new Error('Order not found');
    }

    const status = getOrderStatus(order.order_status_id);

    const history = await orderHistoryRepository.findByOrderId(orderId);
    const historyWithDetails = history.map((entry) => {
        const fromStatus = entry.from_status_id ? getOrderStatus(entry.from_status_id) : null;
        const toStatus = getOrderStatus(entry.to_status_id);
        
        return {
            ...entry,
            from_status_name: fromStatus?.status_name || null,
            to_status_name: toStatus?.status_name || 'UNKNOWN'
        };
    });

    return {
        ...order,
        status_name: status?.status_name || 'UNKNOWN',
        history: historyWithDetails
    };
};

const getOrdersByStoreStaff = async (userId) => {
    const storeStaff = await storeStaffRepository.findByUserId(userId);
    if (!storeStaff) {
        throw new Error('Store staff record not found');
    }

    const orders = await orderRepository.findByStoreStaff(storeStaff.store_staff_id);

    const ordersWithStatus = orders.map((order) => {
        const status = getOrderStatus(order.order_status_id);
        return {
            ...order,
            status_name: status?.status_name || 'UNKNOWN'
        };
    });

    return ordersWithStatus;
};

const getAllOrders = async () => {
    const orders = await orderRepository.findAll();

    const ordersWithStatus = orders.map((order) => {
        const status = getOrderStatus(order.order_status_id);
        return {
            ...order,
            status_name: status?.status_name || 'UNKNOWN'
        };
    });

    return ordersWithStatus;
};

module.exports = {
    createOrder,
    updateOrderStatus,
    getOrderById,
    getOrdersByStoreStaff,
    getAllOrders
};
