const Joi = require('joi');

const createOrderSchema = Joi.object({
    store_staff_id: Joi.string()
        .optional()
        .messages({
            'string.empty': 'Store staff ID cannot be empty'
        }),

    delivery_date: Joi.date()
        .iso()
        .required()
        .messages({
            'any.required': 'Delivery date is required',
            'date.format': 'Delivery date must be in ISO format'
        }),

    items: Joi.array()
        .items(
            Joi.object({
                product_id: Joi.string().required(),
                quantity: Joi.number().positive().required()
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one item is required',
            'any.required': 'Items are required'
        }),

    credits_to_use: Joi.number()
        .min(0)
        .optional()
        .messages({
            'number.min': 'Credits to use cannot be negative',
            'number.base': 'Credits to use must be a number'
        }),

    notes: Joi.string()
        .max(500)
        .optional()
        .messages({
            'string.max': 'Notes cannot exceed 500 characters'
        })
});

const updateOrderStatusSchema = Joi.object({
    order_id: Joi.string()
        .required()
        .messages({
            'any.required': 'Order ID is required',
            'string.empty': 'Order ID cannot be empty'
        }),

    order_status_id: Joi.string()
        .pattern(/^OR10[0-5]$/)
        .required()
        .messages({
            'any.required': 'Order status ID is required',
            'string.pattern.base': 'Order status ID must be in format OR100-OR105'
        })
});

const validateCreateOrder = (data) => {
    return createOrderSchema.validate(data, { abortEarly: false });
};

const validateUpdateOrderStatus = (data) => {
    return updateOrderStatusSchema.validate(data, { abortEarly: false });
};

module.exports = {
    validateCreateOrder,
    validateUpdateOrderStatus
};
