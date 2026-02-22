const { db } = require('../config/firebase');
const COLLECTION = 'risk_pool_transfers';

const create = async (transferData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...transferData,
            created_at: new Date().toISOString()
        });
        
        return {
            transfer_id: docRef.id,
            ...transferData
        };
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
            transfer_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByStoreStaffId = async (storeStaffId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('from_store_staff_id', '==', storeStaffId)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            transfer_id: doc.id,
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
            transfer_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findByOrderId,
    findByStoreStaffId,
    findAll
};
