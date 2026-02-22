const { db } = require('../config/firebase');
const COLLECTION = 'suppliers';

const create = async (supplierData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...supplierData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        return {
            supplier_id: docRef.id,
            ...supplierData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (supplierId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(supplierId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            supplier_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findAll = async () => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        
        return snapshot.docs.map(doc => ({
            supplier_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (supplierId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(supplierId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return findById(supplierId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteSupplier = async (supplierId) => {
    try {
        await db.collection(COLLECTION).doc(supplierId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findAll,
    update,
    deleteSupplier
};
