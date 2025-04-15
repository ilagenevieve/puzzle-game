// Importing utilities
const logger = require('../utils/logger')
const config = require('../../config')

// Central error handler middleware
const errorHandler = (err, req, res, _next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method,
    ...(err.isOperational ? {} : { error: err })
  })

  // Set default values
  let statusCode = err.statusCode || 500
  let errorCode = err.errorCode || 'ERR_INTERNAL'
  let message = err.message || 'Something went wrong'
  let errors = err.errors || []

  // Handle validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    statusCode = 400
    errorCode = 'ERR_VALIDATION'
    message = 'Validation failed'
    errors = err.array()
  }

  // Don't expose internal error details in production
  if (statusCode === 500 && !config.isDevelopment) {
    message = 'Internal server error'
  }

  // Send standard error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(errors.length > 0 ? { errors } : {})
    }
  })
}

module.exports = errorHandler
