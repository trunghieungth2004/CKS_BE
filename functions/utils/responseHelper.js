const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        statusCode,
        status: "SUCCESS",
        message,
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        statusCode,
        status: "ERROR",
        message,
    });
};

module.exports = {
    successResponse,
    errorResponse,
};
