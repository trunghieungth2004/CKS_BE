const storeInventoryRepository = require('../repositories/storeInventoryRepository');
const ckInventoryRepository = require('../repositories/ckInventoryRepository');
const storeStaffRepository = require('../repositories/storeStaffRepository');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getStoreInventory = async (req, res) => {
    try {
        const userId = req.user.uid;

        const storeStaff = await storeStaffRepository.findByUserId(userId);
        
        if (!storeStaff) {
            return errorResponse(res, 404, 'Store staff record not found', 'INV100');
        }

        const inventory = await storeInventoryRepository.findByStoreStaff(storeStaff.store_staff_id);

        return successResponse(res, 200, 'Store inventory retrieved successfully', {
            store_staff_id: storeStaff.store_staff_id,
            store_id: storeStaff.store_id,
            inventory
        }, 'INV101');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

const getCKInventory = async (req, res) => {
    try {
        const inventory = await ckInventoryRepository.findAll();

        return successResponse(res, 200, 'CK inventory retrieved successfully', {
            inventory
        }, 'INV102');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};

module.exports = {
    getStoreInventory,
    getCKInventory
};
