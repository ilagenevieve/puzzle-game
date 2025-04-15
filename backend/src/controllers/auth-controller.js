const authService = require('../services/auth-service')
const logger = require('../utils/logger')

/**
 * Register a new user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.register = async (req, res, next) => {
  try {
    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      display_name: req.body.display_name
    }

    const user = await authService.register(userData)

    // Set user ID in session
    req.session.userId = user.id

    logger.info(`User registered successfully: ${user.username}`)

    return res.status(201).json({
      success: true,
      data: { user }
    })
  } catch (error) {
    logger.error(`Registration error: ${error.message}`)
    next(error)
  }
}

/**
 * Login a user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body

    const user = await authService.authenticate(username, password)

    // Set user ID in session
    req.session.userId = user.id

    logger.info(`User logged in: ${user.username}`)

    return res.status(200).json({
      success: true,
      data: { user }
    })
  } catch (error) {
    logger.error(`Login error: ${error.message}`)
    next(error)
  }
}

/**
 * Logout a user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.logout = async (req, res, next) => {
  try {
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        logger.error(`Logout error: ${err.message}`)
        return next(err)
      }

      // Clear session cookie
      res.clearCookie('connect.sid')

      logger.info('User logged out')

      return res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' }
      })
    })
  } catch (error) {
    logger.error(`Logout error: ${error.message}`)
    next(error)
  }
}

/**
 * Change user password
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { userId } = req.session
    const { currentPassword, newPassword } = req.body

    await authService.changePassword(userId, currentPassword, newPassword)

    logger.info(`Password changed for user ID: ${userId}`)

    return res.status(200).json({
      success: true,
      data: { message: 'Password changed successfully' }
    })
  } catch (error) {
    logger.error(`Change password error: ${error.message}`)
    next(error)
  }
}
