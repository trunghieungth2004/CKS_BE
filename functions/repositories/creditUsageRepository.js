const { db } = require('../config/firebase');
const COLLECTION = 'credit_usage';

const create = async (usageData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...usageData,
            used_at: new Date().toISOString()
        });
        
        return {
            usage_id: docRef.id,
            ...usageData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByCreditId = async (creditId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('credit_id', '==', creditId)
            .orderBy('used_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            usage_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByOrderId = async (orderId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('order_id', '==', orderId)
            .get();
        
        return snapshot.docs.map(doc => ({
            usage_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findByCreditId,
    findByOrderId
};
