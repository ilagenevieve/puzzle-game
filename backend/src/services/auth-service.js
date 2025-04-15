const bcrypt = require('bcrypt')
const userModel = require('../models/user-model')
const { UnauthorizedError, ValidationError } = require('../utils/errors')

/**
 * Register a new user
 *
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.password - Password
 * @param {string} [userData.display_name] - Display name (optional)
 * @returns {Promise<Object>} Created user object without password
 */
const register = async userData => {
  const {
    username, email, password, display_name
  } = userData

  // Hash password
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Create user with hashed password
  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
    display_name: display_name || username
  })

  // Remove password from returned user object
  // eslint-disable-next-line no-unused-vars
  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword
}

/**
 * Authenticate a user by username and password
 *
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<Object>} User object without password
 * @throws {UnauthorizedError} If authentication fails
 */
const authenticate = async (username, password) => {
  // Find user by username
  const user = await userModel.findByUsername(username)

  // Check if user exists
  if (!user) {
    throw new UnauthorizedError('Invalid username or password')
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid username or password')
  }

  // Remove password from returned user object
  // eslint-disable-next-line no-unused-vars
  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword
}

/**
 * Change user password
 *
 * @param {number} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Updated user object without password
 * @throws {UnauthorizedError} If current password is invalid
 * @throws {ValidationError} If new password doesn't meet requirements
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  // Get user with password
  const user = await userModel.findById(userId)

  if (!user) {
    throw new UnauthorizedError('User not found')
  }

  // Get full user data with password
  const userWithPassword = await userModel.findByUsername(user.username)

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password)

  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect')
  }

  // Validate new password
  if (newPassword.length < 8) {
    throw new ValidationError('New password must be at least 8 characters long')
  }

  // Hash new password
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

  // Update user with new password
  const updatedUser = await userModel.update(userId, { password: hashedPassword })

  return updatedUser
}

module.exports = {
  register,
  authenticate,
  changePassword
}
