const { UnauthorizedError, ForbiddenError } = require('../utils/errors')

/**
 * Authentication middleware to protect routes
 * Requires a valid user session
 */
exports.authenticateUser = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return next(new UnauthorizedError('Authentication required'))
  }
  
  return next()
}

/**
 * Authorization middleware for admin-only routes
 * Requires a valid user session with admin role
 */
exports.authorizeAdmin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return next(new UnauthorizedError('Authentication required'))
  }
  
  if (!req.session.isAdmin) {
    return next(new ForbiddenError('Admin access required'))
  }
  
  return next()
}