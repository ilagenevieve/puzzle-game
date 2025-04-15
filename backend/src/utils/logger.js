const pino = require('pino')
const path = require('path')
const fs = require('fs')
const config = require('../../config')

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Configure logger based on environment
const options = {
  level: config.isDevelopment ? 'debug' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
}

// Add pretty printing in development
if (config.isDevelopment) {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  }
}

// Create the logger
const logger = pino(options)

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim())
  },
}

module.exports = logger