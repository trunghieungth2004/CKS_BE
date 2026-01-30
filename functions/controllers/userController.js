const userService = require('../services/userService');
const { validateUserId, checkUserExists } = require('../validators/userValidator');
const { successResponse, errorResponse } = require('../utils/responseHelper');

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
            return errorResponse(res, 400, "userId is required to fetch user");
        }

        const { error } = validateUserId(userId);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        if (!await checkUserExists(userId)) {
            return errorResponse(res, 404, "User with the provided ID does not exist");
        }

        const user = await userService.getUserById(userId);
        
        return successResponse(res, 200, "User entries retrieved successfully", user);
    } catch (error) {
        console.error("Error retrieving user entries:", error);
        return errorResponse(res, 500, "Internal server error while retrieving user entries");
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId, ...updateData } = req.body;
        
        if (!userId) {
            return errorResponse(res, 400, "userId is required to update user");
        }

        if (!await checkUserExists(userId)) {
            return errorResponse(res, 404, "User with the provided ID does not exist");
        }

        const updatedUser = await userService.updateUser(userId, updateData);
        
        return successResponse(res, 200, "User updated successfully", updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return errorResponse(res, 500, error.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return errorResponse(res, 400, "userId is required to delete user");
        }

        if (!await checkUserExists(userId)) {
            return errorResponse(res, 404, "User with the provided ID does not exist");
        }

        await userService.deleteUser(userId);
        
        return successResponse(res, 200, "User deleted successfully");
    } catch (error) {
        console.error("Error deleting user:", error);
        return errorResponse(res, 500, error.message);
    }
};

module.exports = {
    getAllUser,
    getOneUser,
    updateUser,
    deleteUser,
};
