const express = require('express')
const http = require('http')
const cors = require('cors')
const session = require('express-session')
const SQLiteStore = require('connect-sqlite3')(session)
const { ExpressPeerServer } = require('peer')
const socketIo = require('socket.io')
const compression = require('compression')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')

// Import custom modules
const config = require('../config')
const logger = require('./utils/logger')
const errorHandler = require('./middleware/error-handler')
const routes = require('./routes')
const initDatabase = require('./db/init')

// Initialize express app
const app = express()
const server = http.createServer(app)

// Configure PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: config.isDevelopment,
  path: config.peerjs.path,
  port: config.peerjs.port,
})

// Configure Socket.io
const io = socketIo(server, {
  cors: {
    origin: config.cors.origin,
    credentials: true,
  },
})

// Configure session middleware
const sessionMiddleware = session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: path.join(__dirname, '../db'),
  }),
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: config.session.secureCookies,
    sameSite: 'lax',
    maxAge: config.session.maxAge,
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan(config.isDevelopment ? 'dev' : 'combined', { stream: logger.stream }))
app.use(sessionMiddleware)
app.use('/peerjs', peerServer)

// API routes
app.use('/api/v1', routes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Error handler (should be last)
app.use(errorHandler)

// Socket.io Authentication
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
io.use(wrap(sessionMiddleware))
io.use((socket, next) => {
  const session = socket.request.session
  if (session && session.userId) {
    socket.userId = session.userId
    next()
  } else {
    next(new Error('Unauthorized'))
  }
})

// Socket.io connection handling
io.on('connection', socket => {
  logger.info(`User ${socket.userId} connected`)

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`User ${socket.userId} disconnected`)
  })

  // Add other Socket.io event handlers here
})

// Initialize database
initDatabase()
  .then(() => {
    // Start the server
    const PORT = config.port
    server.listen(PORT, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`)
      logger.info(`PeerJS server running on port ${config.peerjs.port}`)
    })
  })
  .catch(err => {
    logger.error(`Failed to initialize database: ${err.message}`, err)
    process.exit(1)
  })

// Export for testing
module.exports = { app, server }