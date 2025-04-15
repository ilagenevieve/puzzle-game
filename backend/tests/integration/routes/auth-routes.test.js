const request = require('supertest')
const { app } = require('../../../src/app')
const userModel = require('../../../src/models/user-model')

// Mock userModel to avoid actual database operations
jest.mock('../../../src/models/user-model')

describe('Auth Routes', () => {
  beforeEach(() => {
    // Clear mocks between tests
    jest.clearAllMocks()
  })

  describe('POST /api/v1/auth/register', () => {
    test('should register a new user successfully', async () => {
      // Setup mock
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' }
      userModel.createUser.mockResolvedValue(mockUser)
      userModel.getUserByUsername.mockResolvedValue(null) // User doesn't exist yet
      
      // Execute request
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          password: 'Password123!',
          email: 'test@example.com'
        })
      
      // Assert response
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toEqual(expect.objectContaining({
        id: 1,
        username: 'testuser'
      }))
    })

    test('should return validation errors for invalid input', async () => {
      // Execute request with invalid data
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'te', // Too short
          password: 'short', // Too short
          email: 'notanemail' // Invalid email format
        })
      
      // Assert response
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ param: 'username' }),
          expect.objectContaining({ param: 'password' }),
          expect.objectContaining({ param: 'email' })
        ])
      )
    })

    test('should return error if username already exists', async () => {
      // Setup mock - user already exists
      userModel.getUserByUsername.mockResolvedValue({ id: 1, username: 'existinguser' })
      
      // Execute request
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'existinguser',
          password: 'Password123!',
          email: 'test@example.com'
        })
      
      // Assert response
      expect(response.status).toBe(409) // Conflict
      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('Username already exists')
    })
  })

  describe('POST /api/v1/auth/login', () => {
    test('should login user with valid credentials', async () => {
      // Setup mock - user exists and password is correct
      userModel.getUserByUsername.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', // Mocked hash
        email: 'test@example.com'
      })
      
      // Mock bcrypt compare to return true
      jest.mock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(true)
      }))
      
      // Execute request
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!'
        })
      
      // Assert response
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toEqual(expect.objectContaining({
        username: 'testuser'
      }))
    })

    test('should return error for invalid credentials', async () => {
      // Setup mock - user not found
      userModel.getUserByUsername.mockResolvedValue(null)
      
      // Execute request
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'Password123!'
        })
      
      // Assert response
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('Invalid credentials')
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    test('should logout the user successfully', async () => {
      // Setup - create a fake session
      const agent = request.agent(app)
      
      // Execute request
      const response = await agent
        .post('/api/v1/auth/logout')
      
      // Assert response
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.message).toContain('Logged out successfully')
    })
  })
})