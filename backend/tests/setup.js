const path = require('path')

// Set environment to test
process.env.NODE_ENV = 'test'
process.env.PORT = 4001
process.env.FRONTEND_URL = 'http://localhost:3001'
process.env.SESSION_SECRET = 'test-secret'
process.env.DATABASE_PATH = path.join(__dirname, 'test-database.sqlite')
process.env.PEERJS_PORT = 9001

// Global test setup
global.console.log = jest.fn() // Silence console.log during tests
global.console.error = jest.fn() // Silence console.error during tests

// Clean up function to run after all tests
afterAll(() => {
  // Any global cleanup needed after all tests
})