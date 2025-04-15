const { validationResult } = require('express-validator')

/**
 * Middleware to validate request using express-validator
 * Extracts validation errors and returns them in a standard format
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION',
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg,
        })),
      },
    })
  }
  
  return next()
}

module.exports = validateRequest