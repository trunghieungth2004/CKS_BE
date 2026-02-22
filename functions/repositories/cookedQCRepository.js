const { db } = require('../config/firebase');
const COLLECTION = 'product_qc';

const create = async (qcData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...qcData,
            created_at: new Date().toISOString()
        });
        
        return {
            qc_id: docRef.id,
            ...qcData
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
        
        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs.map(doc => ({
            qc_id: doc.id,
            ...doc.data()
        }))[0];
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByBatchId = async (batchId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('batch_id', '==', batchId)
            .get();
        
        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs.map(doc => ({
            qc_id: doc.id,
            ...doc.data()
        }))[0];
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findPendingQC = async () => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('qc_status', '==', 'PENDING')
            .get();
        
        return snapshot.docs.map(doc => ({
            qc_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (qcId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(qcId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        const doc = await db.collection(COLLECTION).doc(qcId).get();
        return {
            qc_id: doc.id,
            ...doc.data()
        };
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
            qc_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findByOrderId,
    findByBatchId,
    findPendingQC,
    update,
    findAll
};
