const { db } = require('../config/firebase');
const COLLECTION = 'users';

const create = async (userData) => {
    try {
        const docRef = await db.collection(COLLECTION).add(userData);
        const doc = await docRef.get();
        
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (userId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(userId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByEmail = async (email) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
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
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (userId, updateData) => {
    try {
        const docRef = db.collection(COLLECTION).doc(userId);
        await docRef.update(updateData);
        
        const doc = await docRef.get();
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteById = async (userId) => {
    try {
        await db.collection(COLLECTION).doc(userId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByEmail,
    findAll,
    update,
    deleteById,
};
