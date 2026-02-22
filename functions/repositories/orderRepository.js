const { db } = require('../config/firebase');
const COLLECTION = 'orders';

const create = async (orderData) => {
    try {
        const docRef = await db.collection(COLLECTION).add(orderData);
        const doc = await docRef.get();
        
        return {
            order_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (orderId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(orderId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            order_id: doc.id,
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
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            order_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByStatus = async (orderStatusId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('order_status_id', '==', orderStatusId)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            order_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (orderId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(orderId).update(updateData);
        
        const doc = await db.collection(COLLECTION).doc(orderId).get();
        return {
            order_id: doc.id,
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
            order_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteById = async (orderId) => {
    try {
        await db.collection(COLLECTION).doc(orderId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByStoreStaff,
    findByStatus,
    update,
    findAll,
    deleteById
};
