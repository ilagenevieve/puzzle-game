const path = require('path')
const fs = require('fs')
const SQLite = require('better-sqlite3')
const config = require('../../config')
const logger = require('../utils/logger')

// Ensure the directory exists
const dbDir = path.dirname(config.db.path)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
  logger.info(`Created database directory: ${dbDir}`)
}

// Initialize database connection
let db
try {
  db = new SQLite(config.db.path, { verbose: config.isDevelopment ? logger.debug : null })
  logger.info(`Connected to SQLite database at ${config.db.path}`)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')
  
  // Set busy timeout to avoid locks
  db.pragma('busy_timeout = 5000')
  
  // Optimize for performance
  if (!config.isDevelopment) {
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
  }
} catch (err) {
  logger.error(`Database connection error: ${err.message}`, err)
  throw err
}

// Add helper methods for common operations
const runQuery = (sql, params = []) => {
  try {
    return db.prepare(sql).run(params)
  } catch (err) {
    logger.error(`SQL error (run): ${err.message}`, { sql, params, err })
    throw err
  }
}

const getOne = (sql, params = []) => {
  try {
    return db.prepare(sql).get(params)
  } catch (err) {
    logger.error(`SQL error (get): ${err.message}`, { sql, params, err })
    throw err
  }
}

const getAll = (sql, params = []) => {
  try {
    return db.prepare(sql).all(params)
  } catch (err) {
    logger.error(`SQL error (all): ${err.message}`, { sql, params, err })
    throw err
  }
}

const transaction = (fn) => {
  const transactionFn = db.transaction(fn)
  try {
    return transactionFn()
  } catch (err) {
    logger.error(`Transaction error: ${err.message}`, err)
    throw err
  }
}

module.exports = {
  db,
  run: runQuery,
  get: getOne,
  all: getAll,
  transaction,
}