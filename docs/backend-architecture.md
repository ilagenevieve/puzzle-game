# Backend Architecture

This document outlines the architecture of the Ocean of Puzzles backend.

## Overview

The Ocean of Puzzles backend is built with Node.js and Express, providing a RESTful API for the frontend application. It handles user authentication, game state management, and real-time communication.

## Architecture Layers

The backend follows a layered architecture pattern with clear separation of concerns:

```
┌───────────────┐
│    Routes     │  API endpoints and HTTP methods
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  Controllers  │  Request handling and response formatting
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   Services    │  Business logic and game rules
└───────┬───────┘
        │
        ▼
┌───────────────┐
│    Models     │  Data access and storage
└───────────────┘
```

### Routes Layer

The routes layer defines the API endpoints and HTTP methods. It:

- Maps HTTP requests to controller functions
- Handles request validation via middleware
- Defines route-specific middleware (e.g., authorization)
- Groups related endpoints under router prefixes

Example routes file:

```javascript
// auth-routes.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth-controller');
const validateRequest = require('../middleware/validate-request');

const router = express.Router();

router.post('/register',
  [
    body('username').isAlphanumeric().isLength({ min: 3, max: 20 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    validateRequest
  ],
  authController.register
);

router.post('/login',
  [
    body('username').notEmpty(),
    body('password').notEmpty(),
    validateRequest
  ],
  authController.login
);

router.post('/logout', authController.logout);

module.exports = router;
```

### Controllers Layer

The controllers layer handles HTTP requests and responses. It:

- Extracts and validates request data
- Calls appropriate service methods
- Formats responses according to API standards
- Handles HTTP-specific concerns
- Manages session state

Example controller:

```javascript
// auth-controller.js
const authService = require('../services/auth-service');

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const user = await authService.registerUser({ username, email, password });
    
    // Start session
    req.session.userId = user.id;
    
    // Send response
    res.status(201).json({
      success: true,
      data: { user },
      error: null
    });
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
}

// Other controller methods...

module.exports = { register, login, logout };
```

### Services Layer

The services layer contains the business logic. It:

- Implements domain/business rules
- Coordinates between multiple models
- Handles transaction management
- Is independent of HTTP/transport concerns
- Contains core game logic

Example service:

```javascript
// auth-service.js
const bcrypt = require('bcrypt');
const userModel = require('../models/user-model');
const { ConflictError, AuthenticationError } = require('../utils/errors');

async function registerUser({ username, email, password }) {
  // Check if user exists
  const existingUser = await userModel.findByUsernameOrEmail(username, email);
  if (existingUser) {
    throw new ConflictError('Username or email already exists');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user
  const user = await userModel.createUser({
    username,
    email,
    password_hash: passwordHash
  });
  
  // Return user without password
  delete user.password_hash;
  return user;
}

// Other service methods...

module.exports = { registerUser, loginUser, validateCredentials };
```

### Models Layer

The models layer handles data access and storage. It:

- Interacts directly with the database
- Implements CRUD operations
- Handles data validation and transformation
- Manages relationships between data entities
- Is independent of business logic

Example model:

```javascript
// user-model.js
const db = require('../db/connection');
const { DatabaseError } = require('../utils/errors');

async function findByUsernameOrEmail(username, email) {
  try {
    const query = `
      SELECT * FROM users 
      WHERE username = ? OR email = ?
      LIMIT 1
    `;
    return db.queryOne(query, [username, email]);
  } catch (error) {
    throw new DatabaseError(`Error finding user: ${error.message}`);
  }
}

async function createUser(userData) {
  try {
    const { username, email, password_hash, display_name = username } = userData;
    
    const query = `
      INSERT INTO users (username, email, password_hash, display_name)
      VALUES (?, ?, ?, ?)
      RETURNING id, username, email, display_name, created_at
    `;
    
    return db.queryOne(query, [
      username, 
      email, 
      password_hash, 
      display_name
    ]);
  } catch (error) {
    throw new DatabaseError(`Error creating user: ${error.message}`);
  }
}

// Other model methods...

module.exports = { findByUsernameOrEmail, createUser, findById, updateUser };
```

## Database Access

The application uses SQLite with the `better-sqlite3` library. A dedicated connection module handles database operations:

```javascript
// db/connection.js
const Database = require('better-sqlite3');
const path = require('path');
const { DatabaseError } = require('../utils/errors');

// Get the database path from environment variables or use a default
const dbPath = process.env.DB_PATH || path.join(__dirname, '../db/puzzle_game.sqlite');

// Create or open the database
const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Set pragmas for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Execute a query that returns multiple rows
 */
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(params);
  } catch (error) {
    throw new DatabaseError(`Database query error: ${error.message}`);
  }
}

/**
 * Execute a query that returns a single row
 */
function queryOne(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(params);
  } catch (error) {
    throw new DatabaseError(`Database query error: ${error.message}`);
  }
}

/**
 * Execute a query that doesn't return data
 */
function execute(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(params);
  } catch (error) {
    throw new DatabaseError(`Database execution error: ${error.message}`);
  }
}

/**
 * Run multiple queries in a transaction
 */
function transaction(callback) {
  try {
    return db.transaction(callback)();
  } catch (error) {
    throw new DatabaseError(`Transaction error: ${error.message}`);
  }
}

module.exports = { query, queryOne, execute, transaction };
```

## Middleware

The application uses several middleware for cross-cutting concerns:

### Error Handling Middleware

```javascript
// middleware/error-handler.js
const { ApiError, ValidationError, AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(err);
  
  // Default error
  let statusCode = 500;
  let errorResponse = {
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  };
  
  // Handle specific error types
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorResponse.error.code = err.code;
    errorResponse.error.message = err.message;
  }
  
  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;
```

### Authentication Middleware

```javascript
// middleware/auth.js
const { AuthenticationError } = require('../utils/errors');
const userModel = require('../models/user-model');

async function authenticate(req, res, next) {
  try {
    // Check if user ID is in session
    const userId = req.session?.userId;
    
    if (!userId) {
      throw new AuthenticationError('Authentication required');
    }
    
    // Get user from database
    const user = await userModel.findById(userId);
    
    if (!user) {
      // Clear invalid session
      req.session.destroy();
      throw new AuthenticationError('Authentication required');
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticate };
```

### Request Validation Middleware

```javascript
// middleware/validate-request.js
const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    
    return next(new ValidationError('Validation failed', errorMessages));
  }
  
  next();
}

module.exports = validateRequest;
```

## Error Handling

The application uses custom error classes for different types of errors:

```javascript
// utils/errors.js
class ApiError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 'VALIDATION_ERROR', 400);
    this.details = details;
  }
}

class AuthenticationError extends ApiError {
  constructor(message) {
    super(message, 'UNAUTHORIZED', 401);
  }
}

class AuthorizationError extends ApiError {
  constructor(message) {
    super(message, 'ACCESS_DENIED', 403);
  }
}

class NotFoundError extends ApiError {
  constructor(message) {
    super(message, 'NOT_FOUND', 404);
  }
}

class ConflictError extends ApiError {
  constructor(message) {
    super(message, 'CONFLICT', 409);
  }
}

class DatabaseError extends ApiError {
  constructor(message) {
    super(message, 'DATABASE_ERROR', 500);
  }
}

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError
};
```

## Real-time Communication

The application uses Socket.io for real-time communication:

```javascript
// socket/socket-server.js
const socketIo = require('socket.io');
const { authenticate } = require('../middleware/socket-auth');
const gameHandler = require('./game-handler');
const logger = require('../utils/logger');

function initializeSocketServer(server) {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    }
  });
  
  // Use authentication middleware
  io.use(authenticate);
  
  // Connection handler
  io.on('connection', (socket) => {
    const { user } = socket;
    logger.info(`User connected: ${user.username}`);
    
    // Join user's personal room
    socket.join(`user:${user.id}`);
    
    // Set up game event handlers
    gameHandler(io, socket, user);
    
    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.username}`);
    });
  });
  
  return io;
}

module.exports = initializeSocketServer;
```

## Game Logic

Game logic is implemented in separate services for each game type:

```javascript
// services/games/nim-game.js
const { InvalidMoveError } = require('../../utils/errors');

class NimGame {
  constructor(settings = {}) {
    // Default settings
    this.settings = {
      heaps: [3, 5, 7],
      ...settings
    };
    
    // Initial state
    this.state = {
      board: [...this.settings.heaps],
      currentPlayerIndex: 0,
      lastMove: null,
      gameOver: false,
      winner: null
    };
  }
  
  // Make a move
  makeMove(playerIndex, move) {
    // Validate player turn
    if (playerIndex !== this.state.currentPlayerIndex) {
      throw new InvalidMoveError('Not your turn');
    }
    
    // Validate game not over
    if (this.state.gameOver) {
      throw new InvalidMoveError('Game is already over');
    }
    
    // Validate move
    const { heapIndex, count } = move;
    
    if (
      heapIndex < 0 || 
      heapIndex >= this.state.board.length ||
      count <= 0 ||
      count > this.state.board[heapIndex]
    ) {
      throw new InvalidMoveError('Invalid move');
    }
    
    // Apply move
    this.state.board[heapIndex] -= count;
    this.state.lastMove = { playerIndex, heapIndex, count };
    
    // Check for win condition
    if (this.state.board.every(heap => heap === 0)) {
      this.state.gameOver = true;
      this.state.winner = playerIndex;
    } else {
      // Switch player
      this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % 2;
    }
    
    return this.getState();
  }
  
  // Get current game state
  getState() {
    return { ...this.state };
  }
  
  // Check if the game is over
  isGameOver() {
    return this.state.gameOver;
  }
  
  // Get winner if game is over
  getWinner() {
    return this.state.winner;
  }
}

module.exports = NimGame;
```

## Configuration

Application configuration is centralized in a config module:

```javascript
// config/index.js
require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 4000,
  env: process.env.NODE_ENV || 'development',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Database
  dbPath: process.env.DB_PATH || './db/puzzle_game.sqlite',
  
  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'changeme_in_production',
    name: 'ocean_session',
    cookie: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    },
    resave: false,
    saveUninitialized: false
  },
  
  // PeerJS server
  peerjs: {
    port: process.env.PEERJS_PORT || 9000,
    path: process.env.PEERJS_PATH || '/peerjs',
    key: process.env.PEERJS_KEY || 'peerjs'
  }
};

module.exports = config;
```

## Logging

A centralized logging module based on Pino:

```javascript
// utils/logger.js
const pino = require('pino');

const level = process.env.LOG_LEVEL || 'info';

const logger = pino({
  level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

module.exports = logger;
```

## Application Structure

The application entry point sets up Express, routes, middleware, and server:

```javascript
// app.js
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { ExpressPeerServer } = require('peer');
const http = require('http');

const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const initializeSocketServer = require('./socket/socket-server');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocketServer(server);

// Initialize PeerJS server
const peerServer = ExpressPeerServer(server, {
  path: config.peerjs.path,
  key: config.peerjs.key
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    concurrentDB: true
  }),
  ...config.session
}));

// PeerJS server
app.use('/peerjs', peerServer);

// API routes
app.use('/api/v1', routes);

// Error handler middleware
app.use(errorHandler);

// Start server
server.listen(config.port, () => {
  logger.info(`Server started on port ${config.port} in ${config.env} mode`);
});

// Export app for testing
module.exports = app;
```

## Database Schema

See [Database Design](database-design.md) for the complete database schema.

## Security Considerations

- Password hashing with bcrypt (10 rounds)
- Session-based authentication with secure cookies
- CSRF protection
- Input validation and sanitization
- Proper error handling to avoid information leakage
- Helmet middleware for HTTP security headers
- Rate limiting on sensitive endpoints
- Secure WebSocket connections

## Future Enhancements

- Add Redis for session storage and caching
- Implement GraphQL API alongside REST
- Add Prometheus metrics for monitoring
- Implement WebSocket clustering for horizontal scaling
- Add OAuth for social login
- Implement request tracing for better debugging