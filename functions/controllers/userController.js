const userService = require('../services/userService');
const { validateUserId, checkUserExists } = require('../validators/userValidator');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const storeStaffRepository = require('../repositories/storeStaffRepository');

const getAllUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (userId) {
            return errorResponse(res, 400, "userId should not be provided when fetching all users");
        }

        const allEntries = await userService.getAllUsers();
        
        if (allEntries.length === 0) {
            return errorResponse(res, 404, "No user entries found");
        }

        return successResponse(res, 200, "User entries retrieved successfully", allEntries);
    } catch (error) {
        console.error("Error retrieving user entries:", error);
        return errorResponse(res, 500, error.message);
    }
};

const getOneUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return errorResponse(res, 400, "userId is required to fetch user", 'VAL100');
        }

        const { error } = validateUserId(userId);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        if (!await checkUserExists(userId)) {
            return errorResponse(res, 404, "User with the provided ID does not exist");
        }

        const user = await userService.getUserById(userId);
        
        return successResponse(res, 200, "User retrieved successfully", user, 'USER100');
    } catch (error) {
        console.error("Error retrieving user entries:", error);
        return errorResponse(res, 500, "Internal server error while retrieving user entries");
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId, ...updateData } = req.body;
        
        if (!userId) {
            return errorResponse(res, 400, "userId is required to update user", 'VAL100');
        }

        if (!await checkUserExists(userId)) {
            return errorResponse(res, 404, "User with the provided ID does not exist", 'USER103');
        }

        const updatedUser = await userService.updateUser(userId, updateData);
        
        return successResponse(res, 200, "User updated successfully", updatedUser, 'USER101');
    } catch (error) {
        console.error("Error updating user:", error);
        return errorResponse(res, 500, error.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return errorResponse(res, 400, "userId is required to delete user", 'VAL100');
        }

        if (!await checkUserExists(userId)) {
            return errorResponse(res, 404, "User with the provided ID does not exist", 'USER103');
        }

        await userService.deleteUser(userId);
        
        return successResponse(res, 200, "User deleted successfully", null, 'USER102');
    } catch (error) {
        console.error("Error deleting user:", error);
        return errorResponse(res, 500, error.message);
    }
};

const getStoreInfo = async (req, res) => {
    try {
        const userId = req.user.uid;

        const storeStaff = await storeStaffRepository.findByUserId(userId);
        
        if (!storeStaff) {
            return errorResponse(res, 404, 'Store staff record not found', 'USER103');
        }

        return successResponse(res, 200, 'Store information retrieved successfully', {
            store_staff_id: storeStaff.store_staff_id,
            store_id: storeStaff.store_id,
            user_id: storeStaff.user_id
        }, 'USER100');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

module.exports = {
    getAllUser,
    getOneUser,
    updateUser,
    deleteUser,
    getStoreInfo,
};
