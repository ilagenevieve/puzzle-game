const express = require('express')
const { body } = require('express-validator')
const authController = require('../controllers/auth-controller')
const validateRequest = require('../middleware/validate-request')
const { authenticateUser } = require('../middleware/auth')

const router = express.Router()

// User registration
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .withMessage('Must provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('display_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Display name must be between 1 and 50 characters'),
  ],
  validateRequest,
  authController.register
)

// User login
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  authController.login
)

// User logout
router.post('/logout', authController.logout)

// Change password
router.post(
  '/change-password',
  authenticateUser,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
  ],
  validateRequest,
  authController.changePassword
)

module.exports = router