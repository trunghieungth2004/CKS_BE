const { db } = require('../config/firebase');
const COLLECTION = 'order_history';

const create = async (historyData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...historyData,
            created_at: new Date().toISOString()
        });
        
        return {
            history_id: docRef.id,
            ...historyData
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
            history_id: doc.id,
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
            history_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findByOrderId,
    findAll
};
