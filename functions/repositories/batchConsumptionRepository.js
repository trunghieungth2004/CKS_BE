const { db } = require('../config/firebase');
const COLLECTION = 'batch_consumption';

const create = async (consumptionData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...consumptionData,
            created_at: new Date().toISOString()
        });
        
        return {
            consumption_id: docRef.id,
            ...consumptionData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByOrderId = async (orderId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('order_id', '==', orderId)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            consumption_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByMaterialId = async (materialId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('material_id', '==', materialId)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            consumption_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByDateRange = async (startDate, endDate) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('consumed_at', '>=', startDate)
            .where('consumed_at', '<=', endDate)
            .orderBy('consumed_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            consumption_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findAll = async () => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            consumption_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findByOrderId,
    findByMaterialId,
    findByDateRange,
    findAll
};
