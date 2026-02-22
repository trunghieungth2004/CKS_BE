const { db } = require('../config/firebase');
const COLLECTION = 'store_inventory';

const create = async (inventoryData) => {
    try {
        const docRef = await db.collection(COLLECTION).add(inventoryData);
        const doc = await docRef.get();
        
        return {
            inventory_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (inventoryId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(inventoryId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            inventory_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByStoreStaff = async (storeStaffId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('store_staff_id', '==', storeStaffId)
            .get();
        
        return snapshot.docs.map(doc => ({
            inventory_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByProduct = async (productId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('product_id', '==', productId)
            .get();
        
        return snapshot.docs.map(doc => ({
            inventory_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (inventoryId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(inventoryId).update(updateData);
        
        const doc = await db.collection(COLLECTION).doc(inventoryId).get();
        return {
            inventory_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteById = async (inventoryId) => {
    try {
        await db.collection(COLLECTION).doc(inventoryId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findAll = async () => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        
        return snapshot.docs.map(doc => ({
            inventory_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findAvailableByProduct = async (productId, minQuantity = 1) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('product_id', '==', productId)
            .where('quantity', '>=', minQuantity)
            .get();
        
        const now = new Date();
        return snapshot.docs.map(doc => ({
            inventory_id: doc.id,
            ...doc.data()
        })).filter(inv => {
            if (!inv.expiration_date) return true;
            return new Date(inv.expiration_date) > now;
        });
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deductQuantity = async (inventoryId, quantityToDeduct) => {
    try {
        const inventory = await findById(inventoryId);
        
        if (!inventory) {
            throw new Error(`Inventory not found`);
        }

        const currentQuantity = inventory.quantity || 0;
        if (currentQuantity < quantityToDeduct) {
            throw new Error(`Insufficient inventory. Available: ${currentQuantity}, Required: ${quantityToDeduct}`);
        }

        const newQuantity = currentQuantity - quantityToDeduct;
        
        await db.collection(COLLECTION).doc(inventoryId).update({
            quantity: newQuantity,
            last_updated: new Date().toISOString()
        });

        return findById(inventoryId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByStoreStaff,
    findByProduct,
    update,
    deleteById,
    findAll,
    findAvailableByProduct,
    deductQuantity
};