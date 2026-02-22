const { db } = require('../config/firebase');
const COLLECTION = 'store_staff';

const create = async (storeStaffData) => {
    try {
        const docRef = await db.collection(COLLECTION).add(storeStaffData);
        const doc = await docRef.get();
        
        return {
            store_staff_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (storeStaffId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(storeStaffId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            store_staff_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByUserId = async (userId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('user_id', '==', userId)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            store_staff_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (storeStaffId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(storeStaffId).update(updateData);
        
        const doc = await db.collection(COLLECTION).doc(storeStaffId).get();
        return {
            store_staff_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteById = async (storeStaffId) => {
    try {
        await db.collection(COLLECTION).doc(storeStaffId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByUserId,
    update,
    deleteById
};