const express = require('express')
const authRoutes = require('./auth-routes')
const userRoutes = require('./user-routes')
const gameRoutes = require('./game-routes')

const router = express.Router()

// API Routes
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/games', gameRoutes)

// Default route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Ocean of Puzzles API',
      version: '1.0.0',
    },
  })
})

// 404 for undefined API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ERR_NOT_FOUND',
      message: 'API endpoint not found',
    },
  })
})

module.exports = router