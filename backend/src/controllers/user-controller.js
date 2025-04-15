const userService = require('../services/user-service')
const logger = require('../utils/logger')

/**
 * Get current user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const { userId } = req.session

    const user = await userService.getCurrentUser(userId)

    return res.status(200).json({
      success: true,
      data: { user }
    })
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`)
    next(error)
  }
}

/**
 * Get user by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10)

    const user = await userService.getUserById(userId)

    return res.status(200).json({
      success: true,
      data: { user }
    })
  } catch (error) {
    logger.error(`Get user error: ${error.message}`)
    next(error)
  }
}

/**
 * Update user profile
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10)
    const currentUserId = req.session.userId
    const userData = req.body

    const user = await userService.updateUser(userId, currentUserId, userData)

    logger.info(`User updated: ${user.username}`)

    return res.status(200).json({
      success: true,
      data: { user }
    })
  } catch (error) {
    logger.error(`Update user error: ${error.message}`)
    next(error)
  }
}

/**
 * Get user statistics
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10)

    const stats = await userService.getUserStats(userId)

    return res.status(200).json({
      success: true,
      data: { stats }
    })
  } catch (error) {
    logger.error(`Get user stats error: ${error.message}`)
    next(error)
  }
}

/**
 * Get current user's statistics
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getCurrentUserStats = async (req, res, next) => {
  try {
    const { userId } = req.session

    const stats = await userService.getUserStats(userId)

    return res.status(200).json({
      success: true,
      data: { stats }
    })
  } catch (error) {
    logger.error(`Get current user stats error: ${error.message}`)
    next(error)
  }
}

/**
 * Get user leaderboard
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const gameTypeId = req.query.gameTypeId
      ? parseInt(req.query.gameTypeId, 10)
      : undefined

    const limit = req.query.limit
      ? parseInt(req.query.limit, 10)
      : 10

    const leaderboard = await userService.getLeaderboard({ gameTypeId, limit })

    return res.status(200).json({
      success: true,
      data: { leaderboard }
    })
  } catch (error) {
    logger.error(`Get leaderboard error: ${error.message}`)
    next(error)
  }
}
