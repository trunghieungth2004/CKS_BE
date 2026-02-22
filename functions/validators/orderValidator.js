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
        .pattern(/^OR1[0-9]{2}$/)
        .required()
        .messages({
            'any.required': 'Order status ID is required',
            'string.pattern.base': 'Order status ID must be in format OR1XX'
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
