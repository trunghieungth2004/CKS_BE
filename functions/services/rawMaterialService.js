const rawMaterialRepository = require('../repositories/rawMaterialRepository');

const getAllRawMaterials = async () => {
    return rawMaterialRepository.findAll();
};

const getRawMaterialById = async (materialId) => {
    return rawMaterialRepository.findById(materialId);
};

const createRawMaterial = async ({ material_name, unit, price, description }) => {
    return rawMaterialRepository.create({
        material_name,
        unit,
        price: parseFloat(price),
        description: description || ''
    });
};

const updateRawMaterial = async ({ material_id, material_name, unit, price, description }) => {
    const existingMaterial = await rawMaterialRepository.findById(material_id);
    if (!existingMaterial) {
        return null;
    }

    const updateData = {};
    if (material_name !== undefined) updateData.material_name = material_name;
    if (unit !== undefined) updateData.unit = unit;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;

    await rawMaterialRepository.update(material_id, updateData);
    return { material_id };
};

const deleteRawMaterial = async (materialId) => {
    const existingMaterial = await rawMaterialRepository.findById(materialId);
    if (!existingMaterial) {
        return false;
    }

    await rawMaterialRepository.deleteMaterial(materialId);
    return true;
};

module.exports = {
    getAllRawMaterials,
    getRawMaterialById,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial
};
