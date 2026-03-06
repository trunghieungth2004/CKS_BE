const supplierRepository = require('../repositories/supplierRepository');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierRepository.findAll();
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

        const supplier = await supplierRepository.findById(supplier_id);
        
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

        const supplier = await supplierRepository.create({
            supplier_name,
            contact_person: contact_person || '',
            phone,
            email: email || '',
            address: address || ''
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

        const existingSupplier = await supplierRepository.findById(supplier_id);
        if (!existingSupplier) {
            return errorResponse(res, 404, 'Supplier not found', 'SUP103');
        }

        const updateData = {};
        if (supplier_name !== undefined) updateData.supplier_name = supplier_name;
        if (contact_person !== undefined) updateData.contact_person = contact_person;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (address !== undefined) updateData.address = address;

        await supplierRepository.update(supplier_id, updateData);

        return successResponse(res, 200, 'Supplier updated successfully', { supplier_id });
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

        const existingSupplier = await supplierRepository.findById(supplier_id);
        if (!existingSupplier) {
            return errorResponse(res, 404, 'Supplier not found', 'SUP103');
        }

        await supplierRepository.delete(supplier_id);

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
