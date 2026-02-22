const successResponse = (res, statusCode, message, data = null, statusId = null) => {
    const response = {
        statusCode,
        status: statusId || "SUCCESS",
        message,
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message, statusId = null) => {
    const response = {
        statusCode,
        status: statusId || "ERROR",
        message,
    };
    
    return res.status(statusCode).json(response);
};

module.exports = {
    successResponse,
    errorResponse,
};
