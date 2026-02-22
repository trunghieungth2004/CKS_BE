const { db } = require('../config/firebase');
const COLLECTION = 'production_batches';

const create = async (batchData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...batchData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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

const findBySupplyId = async (supplyId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('supply_id', '==', supplyId)
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByDate = async (date) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('batch_date', '==', date)
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
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
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (batchId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(batchId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return findById(batchId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findAll = async () => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByQCStatus = async (qcStatus) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('qc_status', '==', qcStatus)
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findBySupplierId = async (supplierId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('supplier_id', '==', supplierId)
            .get();
        
        return snapshot.docs.map(doc => ({
            batch_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findReplacementBatches = async (originalBatchId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('replaced_batch_id', '==', originalBatchId)
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
    findBySupplyId,
    findByDate,
    findPendingQC,
    update,
    findAll,
    findByQCStatus,
    findBySupplierId,
    findReplacementBatches
};
