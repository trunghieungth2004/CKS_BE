const { db } = require('../config/firebase');
const COLLECTION = 'raw_material_supplies';

const create = async (supplyData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...supplyData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        return {
            supply_id: docRef.id,
            ...supplyData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (supplyId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(supplyId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            supply_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByDate = async (date) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('supply_date', '==', date)
            .get();
        
        return snapshot.docs.map(doc => ({
            supply_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findPending = async () => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('qc_status', '==', 'PENDING')
            .get();
        
        return snapshot.docs.map(doc => ({
            supply_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findAll = async () => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        
        return snapshot.docs.map(doc => ({
            supply_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (supplyId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(supplyId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return findById(supplyId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteSupply = async (supplyId) => {
    try {
        await db.collection(COLLECTION).doc(supplyId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByDate,
    findPending,
    findAll,
    update,
    deleteSupply
};
