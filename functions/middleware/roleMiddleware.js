const { errorResponse } = require('../utils/responseHelper');
const { getAuthzStatus } = require('../constants/statuses');

const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                const status = getAuthzStatus('AUTHZ100');
                return errorResponse(res, 401, status.description, status.status_id);
            }

            if (!allowedRoles.includes(req.user.role_id)) {
                const status = getAuthzStatus('AUTHZ101');
                return errorResponse(res, 403, status.description, status.status_id);
            }

            next();
        } catch (error) {
            console.error("Role middleware error:", error);
            const status = getAuthzStatus('AUTHZ102');
            return errorResponse(res, 403, status.description, status.status_id);
        }
    };
};

module.exports = roleMiddleware;
