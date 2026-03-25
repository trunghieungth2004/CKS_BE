const rawMaterialService = require('../services/rawMaterialService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllRawMaterials = async (req, res) => {
    try {
        const materials = await rawMaterialService.getAllRawMaterials();
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

        const material = await rawMaterialService.getRawMaterialById(material_id);
        
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

        const material = await rawMaterialService.createRawMaterial({ material_name, unit, price, description });

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

        const result = await rawMaterialService.updateRawMaterial({
            material_id,
            material_name,
            unit,
            price,
            description
        });

        if (!result) {
            return errorResponse(res, 404, 'Raw material not found', 'MAT103');
        }

        return successResponse(res, 200, 'Raw material updated successfully', result);
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

        const deleted = await rawMaterialService.deleteRawMaterial(material_id);
        if (!deleted) {
            return errorResponse(res, 404, 'Raw material not found', 'MAT103');
        }

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
