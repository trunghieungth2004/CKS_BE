const { db } = require('../config/firebase');
const COLLECTION = 'order_disputes';

const create = async (disputeData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...disputeData,
            created_at: new Date().toISOString()
        });

        const doc = await docRef.get();
        return {
            dispute_id: doc.id,
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
            .orderBy('created_at', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            dispute_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (disputeId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(disputeId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            dispute_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const updateStatus = async (disputeId, status, resolvedBy = null, resolutionNotes = '') => {
    try {
        const updateData = {
            status,
            resolved_at: status === 'RESOLVED' ? new Date().toISOString() : null,
            resolved_by: resolvedBy,
            resolution_notes: resolutionNotes
        };

        await db.collection(COLLECTION).doc(disputeId).update(updateData);

        const updated = await db.collection(COLLECTION).doc(disputeId).get();
        return {
            dispute_id: updated.id,
            ...updated.data()
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
            dispute_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByStoreStaff = async (storeStaffId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('store_staff_id', '==', storeStaffId)
            .orderBy('created_at', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            dispute_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findByOrderId,
    findById,
    updateStatus,
    findAll,
    findByStoreStaff
};
