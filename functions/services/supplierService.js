const supplierRepository = require('../repositories/supplierRepository');

const getAllSuppliers = async () => {
    return supplierRepository.findAll();
};

const getSupplierById = async (supplierId) => {
    return supplierRepository.findById(supplierId);
};

const createSupplier = async ({ supplier_name, contact_person, phone, email, address }) => {
    return supplierRepository.create({
        supplier_name,
        contact_person: contact_person || '',
        phone,
        email: email || '',
        address: address || ''
    });
};

const updateSupplier = async ({ supplier_id, supplier_name, contact_person, phone, email, address }) => {
    const existingSupplier = await supplierRepository.findById(supplier_id);
    if (!existingSupplier) {
        return null;
    }

    const updateData = {};
    if (supplier_name !== undefined) updateData.supplier_name = supplier_name;
    if (contact_person !== undefined) updateData.contact_person = contact_person;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;

    await supplierRepository.update(supplier_id, updateData);
    return { supplier_id };
};

const deleteSupplier = async (supplierId) => {
    const existingSupplier = await supplierRepository.findById(supplierId);
    if (!existingSupplier) {
        return false;
    }

    await supplierRepository.deleteSupplier(supplierId);
    return true;
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
