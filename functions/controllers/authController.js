const authService = require('../services/authService');
const { validateLogin, validateRegister } = require('../validators/authValidator');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const register = async (req, res) => {
    try {
        const userData = req.body;

        const { error, value } = validateRegister(userData);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const result = await authService.register(value);

        return successResponse(res, 201, "User registered successfully", result, 'AUTH101');
    } catch (error) {
        console.error("Error registering user:", error);
        const statusId = error.message.includes('already registered') ? 'AUTH104' : 'SYS100';
        const statusCode = error.message.includes('already registered') ? 400 : 500;
        return errorResponse(res, statusCode, error.message, statusId);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { error } = validateLogin(req.body);
        if (error) {
            return errorResponse(res, 400, error.details[0].message);
        }

        const result = await authService.login(email, password);

        return successResponse(res, 200, "Login successful", result, 'AUTH100');
    } catch (error) {
        console.error("Error logging in:", error);
        return errorResponse(res, 401, error.message, 'AUTH102');
    }
};

const verifyToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return errorResponse(res, 400, "Token is required");
        }

        const result = await authService.verifyToken(token);

        return successResponse(res, 200, "Token verified successfully", result);
    } catch (error) {
        console.error("Error verifying token:", error);
        return errorResponse(res, 401, error.message, 'AUTH107');
    }
};

module.exports = {
    register,
    login,
    verifyToken,
};
