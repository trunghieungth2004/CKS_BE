const { db } = require('../config/firebase');
const COLLECTION = 'raw_materials';

const create = async (materialData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...materialData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        return {
            material_id: docRef.id,
            ...materialData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (materialId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(materialId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            material_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByName = async (materialName) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('material_name', '==', materialName)
            .get();
        
        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs.map(doc => ({
            material_id: doc.id,
            ...doc.data()
        }))[0];
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findAll = async () => {
    try {
        const snapshot = await db.collection(COLLECTION).get();
        
        return snapshot.docs.map(doc => ({
            material_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (materialId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(materialId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return findById(materialId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteMaterial = async (materialId) => {
    try {
        await db.collection(COLLECTION).doc(materialId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByName,
    findAll,
    update,
    deleteMaterial
};
