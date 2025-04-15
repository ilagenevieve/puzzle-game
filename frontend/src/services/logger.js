/**
 * Logger service for the frontend
 * Provides consistent logging with different levels and formatting
 */

// Determine if we're in production
const isProd = import.meta.env.PROD || false

// Define log levels and their priority
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

// Current log level - debug in development, info in production
const currentLevel = isProd ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG

/**
 * Format log message with timestamp and additional data
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {Object} Formatted log object
 */
const formatLog = (level, message, data = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  }
}

/**
 * Log only if current level is equal or higher than the specified level
 * @param {number} level - Log level to check against
 * @param {Function} logFn - Logging function to call
 * @param {string} message - Message to log
 * @param {Object} data - Additional data
 */
const logIfEnabled = (level, logFn, message, data) => {
  if (level >= currentLevel) {
    const formattedData = formatLog(
      Object.keys(LOG_LEVELS)[level],
      message,
      data
    )
    logFn(message, formattedData)
  }
}

// Capture global errors
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error ? event.error.stack : null,
  })
})

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason,
    stack: event.reason && event.reason.stack,
  })
})

/**
 * Logger object with methods for each log level
 */
const logger = {
  /**
   * Log a debug message
   * @param {string} message - Message to log
   * @param {Object} data - Additional data
   */
  debug: (message, data) => {
    logIfEnabled(LOG_LEVELS.DEBUG, console.debug, message, data)
  },

  /**
   * Log an info message
   * @param {string} message - Message to log
   * @param {Object} data - Additional data
   */
  info: (message, data) => {
    logIfEnabled(LOG_LEVELS.INFO, console.info, message, data)
  },

  /**
   * Log a warning message
   * @param {string} message - Message to log
   * @param {Object} data - Additional data
   */
  warn: (message, data) => {
    logIfEnabled(LOG_LEVELS.WARN, console.warn, message, data)
  },

  /**
   * Log an error message
   * @param {string} message - Message to log
   * @param {Object} data - Additional data
   */
  error: (message, data) => {
    logIfEnabled(LOG_LEVELS.ERROR, console.error, message, data)
    
    // In a real application, you might want to send critical errors to the backend
    if (isProd) {
      // Example: send error to backend
      try {
        // fetch('/api/v1/logs', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formatLog('ERROR', message, data))
        // }).catch(e => console.error('Failed to send error to server', e))
      } catch (e) {
        // Fail silently - don't want to cause a loop of errors
      }
    }
  },

  /**
   * Create a child logger with predefined context
   * @param {Object} context - Context to add to all log messages
   * @returns {Object} Child logger instance
   */
  child: (context) => {
    return {
      debug: (message, data) => logger.debug(message, { ...context, ...data }),
      info: (message, data) => logger.info(message, { ...context, ...data }),
      warn: (message, data) => logger.warn(message, { ...context, ...data }),
      error: (message, data) => logger.error(message, { ...context, ...data }),
    }
  },
}

export default logger