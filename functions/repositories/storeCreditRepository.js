const { db } = require('../config/firebase');
const COLLECTION = 'store_credits';

const create = async (creditData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...creditData,
            created_at: new Date().toISOString()
        });
        
        return {
            credit_id: docRef.id,
            ...creditData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByStoreStaffId = async (storeStaffId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('store_staff_id', '==', storeStaffId)
            .orderBy('created_at', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            credit_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const getTotalCredits = async (storeStaffId) => {
    try {
        const credits = await findByStoreStaffId(storeStaffId);
        return credits.reduce((sum, credit) => sum + credit.amount, 0);
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
            credit_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findByStoreStaffId,
    getTotalCredits,
    findAll
};
