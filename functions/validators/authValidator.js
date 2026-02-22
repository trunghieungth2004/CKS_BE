const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        }),

    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .optional()
        .messages({
            'string.alphanum': 'Username must contain only alphanumeric characters',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username cannot exceed 30 characters'
        }),

    role_id: Joi.number()
        .integer()
        .valid(0, 1, 2, 3, 4)
        .optional()
        .messages({
            'any.only': 'Role ID must be 0 (admin), 1 (CK staff), 2 (CK supply), 3 (manager), or 4 (store staff)'
        }),

    store_code: Joi.string()
        .when('role_id', {
            is: 4,
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            'any.required': 'Store code is required for store staff'
        }),

    store_name: Joi.string()
        .when('role_id', {
            is: 4,
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            'any.required': 'Store name is required for store staff'
        })
});

const validateLogin = (data) => {
    return loginSchema.validate(data, { abortEarly: false });
};

const validateRegister = (data) => {
    return registerSchema.validate(data, { abortEarly: false });
};

module.exports = {
    validateLogin,
    validateRegister,
};
