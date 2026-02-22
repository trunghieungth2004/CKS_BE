const { db } = require('../config/firebase');
const COLLECTION = 'recipe_ingredients';

const create = async (ingredientData) => {
    try {
        const docRef = await db.collection(COLLECTION).add({
            ...ingredientData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        return {
            ingredient_id: docRef.id,
            ...ingredientData
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findById = async (ingredientId) => {
    try {
        const doc = await db.collection(COLLECTION).doc(ingredientId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            ingredient_id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const findByRecipeId = async (recipeId) => {
    try {
        const snapshot = await db.collection(COLLECTION)
            .where('recipe_id', '==', recipeId)
            .get();
        
        return snapshot.docs.map(doc => ({
            ingredient_id: doc.id,
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
            ingredient_id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const update = async (ingredientId, updateData) => {
    try {
        await db.collection(COLLECTION).doc(ingredientId).update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

        return findById(ingredientId);
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

const deleteIngredient = async (ingredientId) => {
    try {
        await db.collection(COLLECTION).doc(ingredientId).delete();
        return true;
    } catch (error) {
        throw new Error(`Database error: ${error.message}`);
    }
};

module.exports = {
    create,
    findById,
    findByRecipeId,
    findAll,
    update,
    deleteIngredient
};
