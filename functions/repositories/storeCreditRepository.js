const { db } = require('../config/firebase');
const COLLECTION = 'store_credits';

const create = async (creditData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...creditData,
            used_amount: 0,
            remaining_amount: creditData.amount,
            created_at: new Date().toISOString()
        });
        
        return {
            credit_id: docRef.id,
            ...creditData,
            used_amount: 0,
            remaining_amount: creditData.amount
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByStoreStaffId = async (storeStaffId) => {
    try {
        console.log(`Finding credits for store_staff_id: ${storeStaffId}`);
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
        return credits.reduce((sum, credit) => {
            const remaining = credit.remaining_amount ?? credit.amount ?? 0;
            return sum + remaining;
        }, 0);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const getAvailableCredits = async (storeStaffId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('store_staff_id', '==', storeStaffId)
            .orderBy('created_at', 'asc')
            .get();
        
        return snapshot.docs
            .map(doc => ({
                credit_id: doc.id,
                ...doc.data()
            }))
            .filter(credit => {
                const remaining = credit.remaining_amount ?? credit.amount ?? 0;
                return remaining > 0;
            });
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
        const currentRemaining = credit.remaining_amount ?? credit.amount;
        const newRemaining = currentRemaining - amountUsed;
        const newUsed = (credit.used_amount ?? 0) + amountUsed;
        
        const updateData = {
            used_amount: newUsed,
            remaining_amount: newRemaining,
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

const refundCreditUsage = async (creditId, amountToRefund) => {
    try {
        const doc = await db.collection(COLLECTION).doc(creditId).get();
        if (!doc.exists) {
            throw new Error('Credit not found');
        }
        
        const credit = doc.data();
        const currentRemaining = credit.remaining_amount ?? 0;
        const currentUsed = credit.used_amount ?? 0;
        
        const newRemaining = currentRemaining + amountToRefund;
        const newUsed = Math.max(0, currentUsed - amountToRefund);
        
        const updateData = {
            used_amount: newUsed,
            remaining_amount: newRemaining,
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
    refundCreditUsage,
    findAll
};

