const Joi = require('joi');
const userRepository = require('../repositories/userRepository');

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
        const user = await userRepository.findById(userId);
        return !!user;
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
};

const getUserByEmail = async (email) => {
    try {
        return await userRepository.findByEmail(email);
    } catch (error) {
        console.error("Error getting user by email:", error);
        return null;
    }
};

const getRoleByUserId = async (userId) => {
    try {
        const user = await userRepository.findById(userId);
        
        if (!user) {
            return null;
        }

        return user.role_id || 4;
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
