const fs = require('fs')
const path = require('path')
const db = require('./connection')
const logger = require('../utils/logger')
const bcrypt = require('bcrypt')

/**
 * Initialize the database with schema
 */
const initDatabase = async () => {
  const schemaPath = path.join(__dirname, '../../db/schema.sql')
  
  try {
    // Read the schema SQL file
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the schema SQL
    db.db.exec(schemaSql)
    
    // Check if admin user exists
    const adminExists = db.get('SELECT id FROM users WHERE username = ?', ['admin'])
    
    // Create admin user if it doesn't exist
    if (!adminExists && process.env.NODE_ENV === 'development') {
      // Hash password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash('admin123', saltRounds)
      
      // Insert admin user
      db.run(`
        INSERT INTO users (
          username, 
          email, 
          password, 
          display_name, 
          is_admin, 
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, ['admin', 'admin@example.com', hashedPassword, 'Administrator', 1])
      
      const adminId = db.db.prepare('SELECT last_insert_rowid() as id').get().id
      
      // Create admin user stats
      db.run(`
        INSERT INTO user_stats (user_id, created_at, updated_at)
        VALUES (?, datetime('now'), datetime('now'))
      `, [adminId])
      
      logger.info('Admin user created')
    }
    
    logger.info('Database schema initialized successfully')
    return true
  } catch (err) {
    logger.error(`Failed to initialize database schema: ${err.message}`, err)
    throw err
  }
}

module.exports = initDatabase