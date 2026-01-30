const { auth, db } = require('../config/firebase');
const { errorResponse } = require('../utils/responseHelper');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, "No token provided");
        }

        const token = authHeader.split('Bearer ')[1];

        const decodedToken = await auth.verifyIdToken(token);

        const userDoc = await db.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) {
            return errorResponse(res, 401, "User not found");
        }

        const userData = userDoc.data();

        if (!userData.isActive) {
            return errorResponse(res, 401, "Account is deactivated");
        }

        req.user = {
            userId: userDoc.id,
            firebaseUid: userDoc.id,
            email: userData.email,
            username: userData.username,
            role: userData.role,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return errorResponse(res, 401, "Invalid or expired token");
    }
};

module.exports = authMiddleware;
