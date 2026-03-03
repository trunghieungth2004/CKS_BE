const { db } = require('../config/firebase');
const COLLECTION = 'cooked_batches';

const create = async (batchData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...batchData,
            created_at: new Date().toISOString()
        });
        
        return {
            batch_id: docRef.id,
            ...batchData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (batchId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(batchId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            batch_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByOrderId = async (orderId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('order_id', '==', orderId)
            .orderBy('batch_number', 'asc')
            .get();
        
        if (snapshot.empty) {
            return [];
        }

        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByQCStatus = async (status) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('qc_status', '==', status)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByQCStatusAndDate = async (status, cookDate) => {
    try {
        const startOfDay = `${cookDate}T00:00:00.000Z`;
        const date = new Date(cookDate);
        date.setDate(date.getDate() + 1);
        const startOfNextDay = date.toISOString().split('T')[0] + 'T00:00:00.000Z';
        
        const snapshot = await db.collection(COLLECTION)
            .where('qc_status', '==', status)
            .where('cooked_at', '>=', startOfDay)
            .where('cooked_at', '<', startOfNextDay)
            .orderBy('cooked_at', 'asc')
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (batchId, updates) => {
    try {
        await db.collection(COLLECTION).doc(batchId).update({
            ...updates,
            updated_at: new Date().toISOString()
        });

        return findById(batchId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByStoreId = async (storeId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('store_id', '==', storeId)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByDateRange = async (startDate, endDate) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('created_at', '>=', startDate)
            .where('created_at', '<=', endDate)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
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
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByOrderId,
    findByQCStatus,
    findByQCStatusAndDate,
    update,
    findByStoreId,
    findByDateRange,
    findAll
};
