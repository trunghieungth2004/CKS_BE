const supplierService = require('../services/supplierService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();
        return successResponse(res, 200, 'Suppliers retrieved successfully', suppliers);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getSupplierById = async (req, res) => {
    try {
        const { supplier_id } = req.body;

        if (!supplier_id) {
            return errorResponse(res, 400, 'supplier_id is required', 'VAL100');
        }

        const supplier = await supplierService.getSupplierById(supplier_id);
        
        if (!supplier) {
            return errorResponse(res, 404, 'Supplier not found', 'SUP103');
        }

        return successResponse(res, 200, 'Supplier retrieved successfully', supplier);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const createSupplier = async (req, res) => {
    try {
        const { supplier_name, contact_person, phone, email, address } = req.body;

        if (!supplier_name) {
            return errorResponse(res, 400, 'supplier_name is required', 'VAL100');
        }

        if (!phone) {
            return errorResponse(res, 400, 'phone is required', 'VAL100');
        }

        const supplier = await supplierService.createSupplier({
            supplier_name,
            contact_person,
            phone,
            email,
            address
        });

        return successResponse(res, 201, 'Supplier created successfully', supplier, 'SUP100');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { supplier_id, supplier_name, contact_person, phone, email, address } = req.body;

        if (!supplier_id) {
            return errorResponse(res, 400, 'supplier_id is required', 'VAL100');
        }

        const result = await supplierService.updateSupplier({
            supplier_id,
            supplier_name,
            contact_person,
            phone,
            email,
            address
        });

        if (!result) {
            return errorResponse(res, 404, 'Supplier not found', 'SUP103');
        }

        return successResponse(res, 200, 'Supplier updated successfully', result);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const { supplier_id } = req.body;

        if (!supplier_id) {
            return errorResponse(res, 400, 'supplier_id is required', 'VAL100');
        }

        const deleted = await supplierService.deleteSupplier(supplier_id);
        if (!deleted) {
            return errorResponse(res, 404, 'Supplier not found', 'SUP103');
        }

        return successResponse(res, 200, 'Supplier deleted successfully', { supplier_id });
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
