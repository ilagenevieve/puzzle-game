const userModel = require('../models/user-model')
const { NotFoundError, ForbiddenError } = require('../utils/errors')

/**
 * Get a user by ID
 *
 * @param {number} id - User ID
 * @returns {Promise<Object>} User object
 * @throws {NotFoundError} If user not found
 */
const getUserById = async id => {
  const user = await userModel.findById(id)

  if (!user) {
    throw new NotFoundError('User not found')
  }

  return user
}

/**
 * Get current user (from session)
 *
 * @param {number} userId - User ID from session
 * @returns {Promise<Object>} User object
 * @throws {NotFoundError} If user not found
 */
const getCurrentUser = async userId => getUserById(userId)

/**
 * Update a user profile
 *
 * @param {number} userId - User ID being updated
 * @param {number} currentUserId - ID of user making the request
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user object
 * @throws {NotFoundError} If user not found
 * @throws {ForbiddenError} If not authorized to update user
 */
const updateUser = async (userId, currentUserId, userData) => {
  // Check if user exists
  const user = await userModel.findById(userId)

  if (!user) {
    throw new NotFoundError('User not found')
  }

  // Check authorization - user can only update their own profile unless admin
  if (userId !== currentUserId && !user.is_admin) {
    throw new ForbiddenError('Not authorized to update this user')
  }

  // Prevent changing username or email - would need separate functions with verification
  /* eslint-disable no-unused-vars */
  const {
    username, email, password, ...allowedUpdates
  } = userData
  /* eslint-enable no-unused-vars */

  // Update user
  const updatedUser = await userModel.update(userId, allowedUpdates)

  return updatedUser
}

/**
 * Get user statistics
 *
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User statistics
 * @throws {NotFoundError} If user not found
 */
const getUserStats = async userId => {
  // Check if user exists
  const user = await userModel.findById(userId)

  if (!user) {
    throw new NotFoundError('User not found')
  }

  // Get user stats
  const stats = await userModel.getUserStats(userId)

  // Get game type stats
  const gameTypeStats = await userModel.getAllUserGameTypeStats(userId)

  return {
    overall: stats,
    gameTypes: gameTypeStats
  }
}

/**
 * Get user leaderboard
 *
 * @param {Object} options - Leaderboard options
 * @param {number} [options.gameTypeId] - Game type ID (optional)
 * @param {number} [options.limit=10] - Number of users to return
 * @returns {Promise<Array>} Leaderboard of users
 */
const getLeaderboard = async (options = {}) => {
  // eslint-disable-next-line no-unused-vars
  const { gameTypeId, limit = 10 } = options

  // TODO: Implement leaderboard query based on game statistics
  // This would typically be a more complex query joining users with statistics

  // Placeholder for now - would need to implement in the model
  return []
}

module.exports = {
  getUserById,
  getCurrentUser,
  updateUser,
  getUserStats,
  getLeaderboard
}
