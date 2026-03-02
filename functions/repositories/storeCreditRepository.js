const { db } = require('../config/firebase');
const COLLECTION = 'store_credits';

const create = async (creditData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...creditData,
            used_amount: 0,
            remaining_amount: creditData.amount,
            status: 'ACTIVE',
            created_at: new Date().toISOString()
        });
        
        return {
            credit_id: docRef.id,
            ...creditData,
            used_amount: 0,
            remaining_amount: creditData.amount,
            status: 'ACTIVE'
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
        return credits.reduce((sum, credit) => sum + (credit.remaining_amount || credit.amount), 0);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const getAvailableCredits = async (storeStaffId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('store_staff_id', '==', storeStaffId)
            .where('status', '==', 'ACTIVE')
            .orderBy('created_at', 'asc')
            .get();
        
        return snapshot.docs
            .map(doc => ({
                credit_id: doc.id,
                ...doc.data()
            }))
            .filter(credit => (credit.remaining_amount || credit.amount) > 0);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const updateCreditUsage = async (creditId, amountUsed) => {
    try {
        const doc = await db.collection(COLLECTION).doc(creditId).get();
        if (!doc.exists) {
            throw new Error('Credit not found');
        }
        
        const credit = doc.data();
        const currentRemaining = credit.remaining_amount || credit.amount;
        const newRemaining = currentRemaining - amountUsed;
        const newUsed = (credit.used_amount || 0) + amountUsed;
        
        const updateData = {
            used_amount: newUsed,
            remaining_amount: newRemaining,
            status: newRemaining <= 0 ? 'FULLY_USED' : 'ACTIVE',
            updated_at: new Date().toISOString()
        };
        
        await db.collection(COLLECTION).doc(creditId).update(updateData);
        
        return {
            credit_id: creditId,
            ...credit,
            ...updateData
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
    getAvailableCredits,
    updateCreditUsage,
    findAll
};

