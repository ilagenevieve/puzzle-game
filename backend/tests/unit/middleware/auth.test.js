const { requireAuth } = require('../../../src/middleware/auth')

describe('Auth Middleware', () => {
  let req, res, next

  beforeEach(() => {
    // Setup fresh mocks for each test
    req = {
      session: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
  })

  test('should call next() if user is authenticated', () => {
    // Setup - authenticated user
    req.session.userId = 123

    // Execute
    requireAuth(req, res, next)

    // Assert
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  test('should return 401 if user is not authenticated', () => {
    // Setup - unauthenticated user (no userId in session)
    
    // Execute
    requireAuth(req, res, next)

    // Assert
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Unauthorized: Authentication required',
        status: 401
      }
    })
  })

  test('should handle null session gracefully', () => {
    // Setup - null session (edge case)
    req.session = null

    // Execute
    requireAuth(req, res, next)

    // Assert
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Unauthorized: Authentication required',
        status: 401
      }
    })
  })
})