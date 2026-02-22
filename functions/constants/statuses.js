const ORDER_STATUSES = {
    OR100: {
        status_id: 'OR100',
        status_name: 'PENDING',
        description: 'Order submitted, awaiting processing',
        next_statuses: ['OR101', 'OR105']
    },
    OR101: {
        status_id: 'OR101',
        status_name: 'IN_PRODUCTION',
        description: 'Order in kitchen production, materials deducted',
        next_statuses: ['OR102']
    },
    OR102: {
        status_id: 'OR102',
        status_name: 'STAGED',
        description: 'Kitchen cooking complete, staged for dispatch',
        next_statuses: ['OR103']
    },
    OR103: {
        status_id: 'OR103',
        status_name: 'DISPATCHED',
        description: 'Order loaded on truck and dispatched to store',
        next_statuses: ['OR104', 'OR105']
    },
    OR104: {
        status_id: 'OR104',
        status_name: 'DELIVERED',
        description: 'Order received and confirmed by store staff, added to inventory',
        next_statuses: []
    },
    OR105: {
        status_id: 'OR105',
        status_name: 'CANCELLED',
        description: 'Order cancelled before or after dispatch',
        next_statuses: []
    }
};

const AUTH_STATUSES = {
    AUTH100: { status_id: 'AUTH100', status_name: 'SUCCESS', description: 'Authentication successful' },
    AUTH101: { status_id: 'AUTH101', status_name: 'FAILED', description: 'Authentication failed' },
    AUTH102: { status_id: 'AUTH102', status_name: 'INVALID_CREDENTIALS', description: 'Invalid email or password' },
    AUTH103: { status_id: 'AUTH103', status_name: 'TOKEN_EXPIRED', description: 'Authentication token has expired' },
    AUTH104: { status_id: 'AUTH104', status_name: 'TOKEN_INVALID', description: 'Invalid authentication token' },
    AUTH105: { status_id: 'AUTH105', status_name: 'REGISTERED', description: 'User registered successfully' },
    AUTH106: { status_id: 'AUTH106', status_name: 'EMAIL_EXISTS', description: 'Email already registered' },
    AUTH107: { status_id: 'AUTH107', status_name: 'VERIFIED', description: 'Token verified successfully' }
};

const AUTHZ_STATUSES = {
    AUTHZ100: { status_id: 'AUTHZ100', status_name: 'AUTHENTICATION_REQUIRED', description: 'No authentication token provided' },
    AUTHZ101: { status_id: 'AUTHZ101', status_name: 'INSUFFICIENT_PERMISSIONS', description: 'User role does not have permission for this resource' },
    AUTHZ102: { status_id: 'AUTHZ102', status_name: 'ACCESS_DENIED', description: 'Access denied to resource' },
    AUTHZ103: { status_id: 'AUTHZ103', status_name: 'TOKEN_EXPIRED', description: 'Authentication token has expired' },
    AUTHZ104: { status_id: 'AUTHZ104', status_name: 'TOKEN_INVALID', description: 'Invalid authentication token' }
};

const TERMINAL_ORDER_STATUSES = ['OR104', 'OR105'];

const getOrderStatus = (statusId) => {
    return ORDER_STATUSES[statusId] || null;
};

const getAuthStatus = (statusId) => {
    return AUTH_STATUSES[statusId] || null;
};

const getAuthzStatus = (statusId) => {
    return AUTHZ_STATUSES[statusId] || null;
};

const isValidTransition = (fromStatusId, toStatusId) => {
    const fromStatus = getOrderStatus(fromStatusId);
    if (!fromStatus) return false;
    return fromStatus.next_statuses.includes(toStatusId);
};

const isTerminalStatus = (statusId) => {
    return TERMINAL_ORDER_STATUSES.includes(statusId);
};

module.exports = {
    ORDER_STATUSES,
    AUTH_STATUSES,
    AUTHZ_STATUSES,
    TERMINAL_ORDER_STATUSES,
    getOrderStatus,
    getAuthStatus,
    getAuthzStatus,
    isValidTransition,
    isTerminalStatus
};
