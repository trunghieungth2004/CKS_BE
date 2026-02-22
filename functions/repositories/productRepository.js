const { db } = require('../config/firebase');
const COLLECTION = 'products';

const create = async (productData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        return {
            product_id: docRef.id,
            ...productData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (productId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(productId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            product_id: doc.id,
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
            product_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (productId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(productId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return findById(productId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteProduct = async (productId) => {
    try {
        await db.collection(COLLECTION).doc(productId).delete();
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
    deleteProduct
};
