const path = require('path')
const dotenv = require('dotenv')

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Helper function to ensure required variables are set
const requireEnv = name => {
  const value = process.env[name]
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Environment variable ${name} is required in production mode`)
  }
  return value
}

// Environment configuration
const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  port: parseInt(process.env.PORT || '4000', 10),

  // Database configuration
  db: {
    path: process.env.DB_PATH || path.join(__dirname, '../db/puzzle_game.sqlite')
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000', 10), // 7 days in ms
    inactiveTimeout: parseInt(process.env.SESSION_INACTIVE_TIMEOUT || '1800000', 10), // 30 min
    secureCookies: process.env.SECURE_COOKIES === 'true'
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // PeerJS configuration
  peerjs: {
    port: parseInt(process.env.PEERJS_PORT || '9000', 10),
    path: process.env.PEERJS_PATH || '/peerjs',
    key: process.env.PEERJS_KEY || 'peerjs',
    stunServer: process.env.STUN_SERVER || 'stun:stun.l.google.com:19302',
    turnServer: process.env.TURN_SERVER || null,
    turnUsername: process.env.TURN_USERNAME || null,
    turnCredential: process.env.TURN_CREDENTIAL || null
  }
}

// Validate required variables in production
if (config.nodeEnv === 'production') {
  requireEnv('SESSION_SECRET')
}

module.exports = config
