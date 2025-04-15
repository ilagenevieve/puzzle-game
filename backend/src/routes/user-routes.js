const express = require('express')
const { body, param, query } = require('express-validator')
const userController = require('../controllers/user-controller')
const validateRequest = require('../middleware/validate-request')
const { authenticateUser } = require('../middleware/auth')

const router = express.Router()

// Get current user
router.get('/me', authenticateUser, userController.getCurrentUser)

// Get current user stats
router.get('/me/stats', authenticateUser, userController.getCurrentUserStats)

// Get leaderboard
router.get(
  '/leaderboard',
  [
    query('gameTypeId').optional().isInt({ min: 1 }).withMessage('Game type ID must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  userController.getLeaderboard
)

// Get user by ID
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  ],
  validateRequest,
  userController.getUserById
)

// Update user
router.put(
  '/:id',
  authenticateUser,
  [
    param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
    body('display_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Display name must be between 1 and 50 characters'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
  ],
  validateRequest,
  userController.updateUser
)

// Get user stats
router.get(
  '/:id/stats',
  [
    param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  ],
  validateRequest,
  userController.getUserStats
)

module.exports = router