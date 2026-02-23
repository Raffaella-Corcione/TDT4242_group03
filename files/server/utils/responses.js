/**
 * Standard API response helpers
 * Ensures consistent response structure across all endpoints
 */

function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
}

function errorResponse(res, message, statusCode = 500, error = null) {
  const response = {
    success: false,
    message
  };

  // Include error details in development only
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
}

function validationError(res, message, errors = null) {
  return errorResponse(res, message, 400, errors);
}

function notFoundError(res, message = 'Resource not found') {
  return errorResponse(res, message, 404);
}

function serverError(res, message = 'Internal server error', error = null) {
  return errorResponse(res, message, 500, error);
}

module.exports = {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
  serverError
};
