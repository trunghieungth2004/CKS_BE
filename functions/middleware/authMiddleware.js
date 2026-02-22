const { auth } = require('../config/firebase');
const userRepository = require('../repositories/userRepository');
const { errorResponse } = require('../utils/responseHelper');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, "No token provided", 'AUTH105');
        }

        const token = authHeader.split('Bearer ')[1];

        const decodedToken = await auth.verifyIdToken(token);

        const userData = await userRepository.findById(decodedToken.uid);

        if (!userData) {
            return errorResponse(res, 401, "User not found", 'AUTH103');
        }

        req.user = {
            uid: userData.user_id,
            user_id: userData.user_id,
            firebaseUid: userData.user_id,
            email: userData.email,
            username: userData.username,
            role_id: userData.role_id,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return errorResponse(res, 401, "Invalid or expired token", 'AUTH107');
    }
};

module.exports = authMiddleware;
