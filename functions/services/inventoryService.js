const storeInventoryRepository = require('../repositories/storeInventoryRepository');
const ckInventoryRepository = require('../repositories/ckInventoryRepository');
const storeStaffRepository = require('../repositories/storeStaffRepository');
const riskPoolRepository = require('../repositories/riskPoolTransferRepository');

const getStoreInventory = async (userId) => {
    const storeStaff = await storeStaffRepository.findByUserId(userId);
    if (!storeStaff) {
        return null;
    }

    const inventory = await storeInventoryRepository.findByStoreStaff(storeStaff.store_staff_id);

    return {
        store_staff_id: storeStaff.store_staff_id,
        store_id: storeStaff.store_id,
        inventory
    };
};

const getCKInventory = async () => {
    const inventory = await ckInventoryRepository.findAll();
    return { inventory };
};

const getStoreRiskPoolInventory = async (userId) => {
    const storeStaff = await storeStaffRepository.findByUserId(userId);
    if (!storeStaff) {
        return null;
    }

    const riskPoolTransfers = await riskPoolRepository.findByStoreStaffId(storeStaff.store_staff_id);

    return {
        store_staff_id: storeStaff.store_staff_id,
        riskPoolTransfers
    };
};

module.exports = {
    getStoreInventory,
    getCKInventory,
    getStoreRiskPoolInventory
};
