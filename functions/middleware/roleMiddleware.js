const { errorResponse } = require('../utils/responseHelper');

const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return errorResponse(res, 401, "Authentication required");
            }

            if (!allowedRoles.includes(req.user.role)) {
                return errorResponse(res, 403, "You do not have permission to access this resource");
            }

            next();
        } catch (error) {
            console.error("Role middleware error:", error);
            return errorResponse(res, 403, "Access denied");
        }
    };
};

module.exports = roleMiddleware;
