import logger from './logger'
import { toastStore } from '../stores/user-store'

/**
 * Error handling service for frontend
 * Centralizes error handling and provides consistent user feedback
 */

// Define known error types
export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', data = {}) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.data = data
    this.timestamp = new Date().toISOString()
  }
}

export class ApiError extends AppError {
  constructor(message, status = 500, code = 'API_ERROR', data = {}) {
    super(message, code, data)
    this.name = 'ApiError'
    this.status = status
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = [], code = 'VALIDATION_ERROR') {
    super(message, code, { fields })
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication failed', code = 'AUTH_ERROR') {
    super(message, code)
    this.name = 'AuthError'
  }
}

export class GameError extends AppError {
  constructor(message, gameId = null, code = 'GAME_ERROR', data = {}) {
    super(message, code, { ...data, gameId })
    this.name = 'GameError'
  }
}

/**
 * Central error handling function
 * @param {Error} error - The error to handle
 * @param {Object} options - Options for error handling
 * @param {boolean} options.showToast - Whether to show a toast message
 * @param {boolean} options.silent - Whether to suppress console logging
 * @param {Function} options.callback - Callback function to execute after handling
 */
export const handleError = (error, options = {}) => {
  const { showToast = true, silent = false, callback = null } = options
  
  // Default error information
  let errorMessage = 'An unexpected error occurred'
  let errorCode = 'UNKNOWN_ERROR'
  let errorData = {}
  let logLevel = 'error'
  
  // Extract information based on error type
  if (error instanceof AppError) {
    errorMessage = error.message
    errorCode = error.code
    errorData = error.data
    
    // Map certain errors to warning level
    if (error instanceof ValidationError) {
      logLevel = 'warn'
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
    
    // Check for network errors
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      errorCode = 'NETWORK_ERROR'
      errorMessage = 'Network connection issue. Please check your internet connection.'
    }
  }
  
  // Log the error (unless silent)
  if (!silent) {
    if (logLevel === 'warn') {
      logger.warn(errorMessage, { code: errorCode, ...errorData, error })
    } else {
      logger.error(errorMessage, { code: errorCode, ...errorData, error })
    }
  }
  
  // Show toast notification if requested
  if (showToast) {
    toastStore.show(errorMessage, 'error')
  }
  
  // Execute callback if provided
  if (typeof callback === 'function') {
    callback(error)
  }
  
  // Return error information
  return { message: errorMessage, code: errorCode, data: errorData }
}

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {Object} options - Error handling options
 * @returns {Function} Wrapped function
 */
export const withErrorHandling = (fn, options = {}) => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error, options)
      throw error // Re-throw for caller to handle if needed
    }
  }
}

export default {
  handleError,
  withErrorHandling,
  AppError,
  ApiError,
  ValidationError,
  AuthError,
  GameError,
}