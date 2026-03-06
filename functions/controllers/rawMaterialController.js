const rawMaterialRepository = require('../repositories/rawMaterialRepository');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllRawMaterials = async (req, res) => {
    try {
        const materials = await rawMaterialRepository.findAll();
        return successResponse(res, 200, 'Raw materials retrieved successfully', materials);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getRawMaterialById = async (req, res) => {
    try {
        const { material_id } = req.body;

        if (!material_id) {
            return errorResponse(res, 400, 'material_id is required', 'VAL100');
        }

        const material = await rawMaterialRepository.findById(material_id);
        
        if (!material) {
            return errorResponse(res, 404, 'Raw material not found', 'MAT103');
        }

        return successResponse(res, 200, 'Raw material retrieved successfully', material);
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const createRawMaterial = async (req, res) => {
    try {
        const { material_name, unit, price, description } = req.body;

        if (!material_name) {
            return errorResponse(res, 400, 'material_name is required', 'VAL100');
        }

        if (!unit) {
            return errorResponse(res, 400, 'unit is required', 'VAL100');
        }

        if (!price || price <= 0) {
            return errorResponse(res, 400, 'Valid price is required', 'VAL100');
        }

        const material = await rawMaterialRepository.create({
            material_name,
            unit,
            price: parseFloat(price),
            description: description || ''
        });

        return successResponse(res, 201, 'Raw material created successfully', material, 'MAT100');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const updateRawMaterial = async (req, res) => {
    try {
        const { material_id, material_name, unit, price, description } = req.body;

        if (!material_id) {
            return errorResponse(res, 400, 'material_id is required', 'VAL100');
        }

        const existingMaterial = await rawMaterialRepository.findById(material_id);
        if (!existingMaterial) {
            return errorResponse(res, 404, 'Raw material not found', 'MAT103');
        }

        const updateData = {};
        if (material_name !== undefined) updateData.material_name = material_name;
        if (unit !== undefined) updateData.unit = unit;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (description !== undefined) updateData.description = description;

        await rawMaterialRepository.update(material_id, updateData);

        return successResponse(res, 200, 'Raw material updated successfully', { material_id });
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const deleteRawMaterial = async (req, res) => {
    try {
        const { material_id } = req.body;

        if (!material_id) {
            return errorResponse(res, 400, 'material_id is required', 'VAL100');
        }

        const existingMaterial = await rawMaterialRepository.findById(material_id);
        if (!existingMaterial) {
            return errorResponse(res, 404, 'Raw material not found', 'MAT103');
        }

        await rawMaterialRepository.delete(material_id);

        return successResponse(res, 200, 'Raw material deleted successfully', { material_id });
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

module.exports = {
    getAllRawMaterials,
    getRawMaterialById,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial
};
