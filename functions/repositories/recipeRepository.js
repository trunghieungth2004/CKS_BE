const { db } = require('../config/firebase');
const COLLECTION = 'recipes';

const create = async (recipeData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...recipeData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        return {
            recipe_id: docRef.id,
            ...recipeData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (recipeId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(recipeId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            recipe_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByProductId = async (productId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('product_id', '==', productId)
            .get();
        
        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs.map(doc => ({
            recipe_id: doc.id,
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
            recipe_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (recipeId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(recipeId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return findById(recipeId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteRecipe = async (recipeId) => {
    try {
        await db.collection(COLLECTION).doc(recipeId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByProductId,
    findAll,
    update,
    deleteRecipe
};
