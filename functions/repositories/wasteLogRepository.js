const { db } = require('../config/firebase');
const COLLECTION = 'waste_logs';

const create = async (wasteData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...wasteData,
            created_at: new Date().toISOString()
        });
        
        return {
            waste_id: docRef.id,
            ...wasteData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (wasteId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(wasteId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            waste_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByDate = async (date) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('waste_date', '==', date)
            .get();
        
        return snapshot.docs.map(doc => ({
            waste_id: doc.id,
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
            waste_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByDate,
    findAll
};
