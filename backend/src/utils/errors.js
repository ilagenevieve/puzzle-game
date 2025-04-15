class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode || `ERR_${statusCode}`
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'ERR_NOT_FOUND')
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'ERR_UNAUTHORIZED')
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden action') {
    super(message, 403, 'ERR_FORBIDDEN')
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400, 'ERR_VALIDATION')
    this.errors = errors
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'ERR_CONFLICT')
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'ERR_BAD_REQUEST')
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'ERR_INTERNAL')
  }
}

class InvalidMoveError extends AppError {
  constructor(message = 'Invalid game move') {
    super(message, 400, 'ERR_INVALID_MOVE')
  }
}

module.exports = {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  BadRequestError,
  InternalServerError,
  InvalidMoveError,
}