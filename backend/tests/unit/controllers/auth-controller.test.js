const { login, register, logout } = require('../../../src/controllers/auth-controller')
const authService = require('../../../src/services/auth-service')

// Mock dependencies
jest.mock('../../../src/services/auth-service')

describe('Auth Controller', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      body: {},
      session: {}
    }
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    test('should return 200 and user data on successful login', async () => {
      // Setup
      const user = { id: 1, username: 'testuser' }
      req.body = { username: 'testuser', password: 'password123' }
      authService.authenticateUser.mockResolvedValue(user)
      
      // Execute
      await login(req, res, next)
      
      // Assert
      expect(authService.authenticateUser).toHaveBeenCalledWith('testuser', 'password123')
      expect(req.session.userId).toBe(1)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user }
      })
    })

    test('should pass error to next middleware on authentication failure', async () => {
      // Setup
      const error = new Error('Invalid credentials')
      req.body = { username: 'testuser', password: 'wrongpassword' }
      authService.authenticateUser.mockRejectedValue(error)
      
      // Execute
      await login(req, res, next)
      
      // Assert
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('register', () => {
    test('should return 201 and user data on successful registration', async () => {
      // Setup
      const user = { id: 1, username: 'newuser' }
      req.body = { username: 'newuser', password: 'password123', email: 'user@example.com' }
      authService.registerUser.mockResolvedValue(user)
      
      // Execute
      await register(req, res, next)
      
      // Assert
      expect(authService.registerUser).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'password123',
        email: 'user@example.com'
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user }
      })
    })

    test('should pass error to next middleware on registration failure', async () => {
      // Setup
      const error = new Error('Username already exists')
      req.body = { username: 'existinguser', password: 'password123', email: 'user@example.com' }
      authService.registerUser.mockRejectedValue(error)
      
      // Execute
      await register(req, res, next)
      
      // Assert
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('logout', () => {
    test('should destroy session and return success message', async () => {
      // Setup
      req.session.destroy = jest.fn(callback => callback(null))
      
      // Execute
      await logout(req, res, next)
      
      // Assert
      expect(req.session.destroy).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Logged out successfully' }
      })
    })

    test('should pass error to next middleware on session destruction failure', async () => {
      // Setup
      const error = new Error('Session destruction failed')
      req.session.destroy = jest.fn(callback => callback(error))
      
      // Execute
      await logout(req, res, next)
      
      // Assert
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})