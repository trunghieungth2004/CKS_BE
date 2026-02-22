const { db } = require('../config/firebase');
const COLLECTION = 'ck_inventory';

const create = async (inventoryData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...inventoryData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        return {
            inventory_id: docRef.id,
            ...inventoryData
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

const findByMaterialId = async (materialId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('material_id', '==', materialId)
            .get();
        
        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs.map(doc => ({
            inventory_id: doc.id,
            ...doc.data()
        }))[0];
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

const update = async (inventoryId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(inventoryId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return findById(inventoryId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const updateQuantity = async (materialId, quantityChange) => {
    try {
        const inventory = await findByMaterialId(materialId);
        
        if (!inventory) {
            return create({
                material_id: materialId,
                quantity: quantityChange,
                status: 'RAW'
            });
        }

        const newQuantity = (inventory.quantity || 0) + quantityChange;
        
        await db.collection(COLLECTION).doc(inventory.inventory_id).update({
            quantity: newQuantity,
            updated_at: new Date().toISOString()
        });

        return findById(inventory.inventory_id);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deductQuantity = async (materialId, quantityToDeduct) => {
    try {
        const inventory = await findByMaterialId(materialId);
        
        if (!inventory) {
            throw new Error(`No inventory found for material ${materialId}`);
        }

        const currentQuantity = inventory.quantity || 0;
        if (currentQuantity < quantityToDeduct) {
            throw new Error(`Insufficient inventory. Available: ${currentQuantity}, Required: ${quantityToDeduct}`);
        }

        const newQuantity = currentQuantity - quantityToDeduct;
        
        await db.collection(COLLECTION).doc(inventory.inventory_id).update({
            quantity: newQuantity,
            updated_at: new Date().toISOString()
        });

        return findById(inventory.inventory_id);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteInventory = async (inventoryId) => {
    try {
        await db.collection(COLLECTION).doc(inventoryId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByMaterialId,
    findAll,
    update,
    updateQuantity,
    deductQuantity,
    deleteInventory
};
