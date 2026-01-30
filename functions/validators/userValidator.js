const Joi = require('joi');
const { db } = require('../config/firebase');

const userIdSchema = Joi.string()
    .required()
    .messages({
        'any.required': 'User ID is required',
        'string.empty': 'User ID cannot be empty'
    });

const validateUserId = (id) => {
    return userIdSchema.validate(id);
};

const checkUserExists = async (userId) => {
    try {
        const doc = await db.collection('users').doc(userId).get();
        return doc.exists;
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
};

const getUserByEmail = async (email) => {
    try {
        const snapshot = await db.collection('users')
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
        console.error("Error getting user by email:", error);
        return null;
    }
};

const getRoleByUserId = async (userId) => {
    try {
        const doc = await db.collection('users').doc(userId).get();
        
        if (!doc.exists) {
            return null;
        }

        return doc.data().role || 'user';
    } catch (error) {
        console.error("Error getting user role:", error);
        return null;
    }
};

module.exports = {
    validateUserId,
    checkUserExists,
    getUserByEmail,
    getRoleByUserId,
};
