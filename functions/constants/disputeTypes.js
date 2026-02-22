const DISPUTE_TYPES = {
    DISP100: {
        code: 'DISP100',
        type: 'MISSING',
        description: 'Item was not included in delivery'
    },
    DISP101: {
        code: 'DISP101',
        type: 'SPOILED',
        description: 'Item arrived spoiled or contaminated'
    },
    DISP102: {
        code: 'DISP102',
        type: 'DAMAGED',
        description: 'Item arrived damaged or broken'
    },
    DISP103: {
        code: 'DISP103',
        type: 'WRONG_ITEM',
        description: 'Wrong item delivered instead of ordered item'
    },
    DISP104: {
        code: 'DISP104',
        type: 'QUANTITY_MISMATCH',
        description: 'Delivered quantity does not match ordered quantity'
    }
};

const DISPUTE_STATUSES = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    RESOLVED: 'RESOLVED'
};

const DISPUTE_FILING_WINDOW_HOURS = 1;

const getDisputeType = (code) => {
    return DISPUTE_TYPES[code] || null;
};

const isValidDisputeType = (type) => {
    return Object.values(DISPUTE_TYPES).some(dt => dt.type === type);
};

module.exports = {
    DISPUTE_TYPES,
    DISPUTE_STATUSES,
    DISPUTE_FILING_WINDOW_HOURS,
    getDisputeType,
    isValidDisputeType
};
