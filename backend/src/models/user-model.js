const db = require('../db/connection')
const { ConflictError, NotFoundError } = require('../utils/errors')

/**
 * Find a user by ID
 * 
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findById = async (id) => {
  try {
    const user = db.get(`
      SELECT id, username, email, display_name, avatar, is_admin, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [id])
    
    return user || null
  } catch (err) {
    throw err
  }
}

/**
 * Find a user by username
 * 
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findByUsername = async (username) => {
  try {
    const user = db.get(`
      SELECT id, username, email, password, display_name, avatar, is_admin, created_at, updated_at
      FROM users 
      WHERE username = ?
    `, [username])
    
    return user || null
  } catch (err) {
    throw err
  }
}

/**
 * Find a user by email
 * 
 * @param {string} email - Email to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
const findByEmail = async (email) => {
  try {
    const user = db.get(`
      SELECT id, username, email, password, display_name, avatar, is_admin, created_at, updated_at
      FROM users 
      WHERE email = ?
    `, [email])
    
    return user || null
  } catch (err) {
    throw err
  }
}

/**
 * Create a new user
 * 
 * @param {Object} userData - User data to create
 * @param {string} userData.username - User's username
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's hashed password
 * @param {string} [userData.display_name] - User's display name (optional)
 * @param {string} [userData.avatar] - User's avatar URL (optional)
 * @returns {Promise<Object>} Created user object
 * @throws {ConflictError} If username or email already exists
 */
const create = async (userData) => {
  const { username, email, password, display_name = null, avatar = null } = userData
  
  try {
    // Check if username or email already exists
    const existingUser = db.get(
      'SELECT username, email FROM users WHERE username = ? OR email = ?',
      [username, email]
    )
    
    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictError('Username already exists')
      }
      throw new ConflictError('Email already exists')
    }
    
    // Insert new user
    const result = db.run(`
      INSERT INTO users (username, email, password, display_name, avatar, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [username, email, password, display_name, avatar])
    
    if (!result.lastInsertRowid) {
      throw new Error('Failed to create user')
    }
    
    // Get the created user
    const user = await findById(result.lastInsertRowid)
    
    // Create initial user stats
    db.run(`
      INSERT INTO user_stats (user_id, created_at, updated_at)
      VALUES (?, datetime('now'), datetime('now'))
    `, [user.id])
    
    return user
  } catch (err) {
    if (err instanceof ConflictError) {
      throw err
    }
    throw new Error(`Error creating user: ${err.message}`)
  }
}

/**
 * Update a user
 * 
 * @param {number} id - User ID to update
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user object
 * @throws {NotFoundError} If user not found
 * @throws {ConflictError} If new username or email already exists
 */
const update = async (id, userData) => {
  try {
    // Check if user exists
    const existingUser = await findById(id)
    if (!existingUser) {
      throw new NotFoundError('User not found')
    }
    
    const updates = []
    const values = []
    
    // Build dynamic update query
    Object.keys(userData).forEach(key => {
      if (['username', 'email', 'display_name', 'avatar', 'password'].includes(key)) {
        updates.push(`${key} = ?`)
        values.push(userData[key])
      }
    })
    
    if (updates.length === 0) {
      return existingUser // No updates to make
    }
    
    // Add updated_at
    updates.push('updated_at = datetime(\'now\')')
    
    // Add id to values array for WHERE clause
    values.push(id)
    
    // Execute update
    db.run(`
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `, values)
    
    // Get updated user
    return findById(id)
  } catch (err) {
    throw err
  }
}

/**
 * Delete a user
 * 
 * @param {number} id - User ID to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const remove = async (id) => {
  try {
    const result = db.run('DELETE FROM users WHERE id = ?', [id])
    return result.changes > 0
  } catch (err) {
    throw err
  }
}

/**
 * Get user statistics
 * 
 * @param {number} id - User ID
 * @returns {Promise<Object>} User statistics
 * @throws {NotFoundError} If user not found
 */
const getUserStats = async (id) => {
  try {
    // Check if user exists
    const user = await findById(id)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    
    // Get user stats
    const stats = db.get(`
      SELECT 
        user_id,
        games_played,
        games_won,
        games_lost,
        games_drawn,
        created_at,
        updated_at
      FROM user_stats 
      WHERE user_id = ?
    `, [id])
    
    if (!stats) {
      // Create stats if they don't exist
      db.run(`
        INSERT INTO user_stats (user_id, created_at, updated_at)
        VALUES (?, datetime('now'), datetime('now'))
      `, [id])
      
      return {
        user_id: id,
        games_played: 0,
        games_won: 0,
        games_lost: 0,
        games_drawn: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    return stats
  } catch (err) {
    throw err
  }
}

/**
 * Get user game type statistics
 * 
 * @param {number} id - User ID
 * @param {number} gameTypeId - Game type ID
 * @returns {Promise<Object>} User game type statistics
 * @throws {NotFoundError} If user not found
 */
const getUserGameTypeStats = async (id, gameTypeId) => {
  try {
    // Check if user exists
    const user = await findById(id)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    
    // Get user game type stats
    const stats = db.get(`
      SELECT 
        user_id,
        game_type_id,
        games_played,
        games_won,
        games_lost,
        games_drawn,
        created_at,
        updated_at
      FROM user_game_type_stats 
      WHERE user_id = ? AND game_type_id = ?
    `, [id, gameTypeId])
    
    if (!stats) {
      // Create stats if they don't exist
      db.run(`
        INSERT INTO user_game_type_stats (user_id, game_type_id, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `, [id, gameTypeId])
      
      return {
        user_id: id,
        game_type_id: gameTypeId,
        games_played: 0,
        games_won: 0,
        games_lost: 0,
        games_drawn: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    return stats
  } catch (err) {
    throw err
  }
}

/**
 * Get all user game type statistics
 * 
 * @param {number} id - User ID
 * @returns {Promise<Array>} Array of user game type statistics
 * @throws {NotFoundError} If user not found
 */
const getAllUserGameTypeStats = async (id) => {
  try {
    // Check if user exists
    const user = await findById(id)
    if (!user) {
      throw new NotFoundError('User not found')
    }
    
    // Get all user game type stats
    return db.all(`
      SELECT 
        ugts.user_id,
        ugts.game_type_id,
        gt.name as game_type_name,
        ugts.games_played,
        ugts.games_won,
        ugts.games_lost,
        ugts.games_drawn,
        ugts.created_at,
        ugts.updated_at
      FROM user_game_type_stats ugts
      JOIN game_types gt ON ugts.game_type_id = gt.id
      WHERE ugts.user_id = ?
    `, [id])
  } catch (err) {
    throw err
  }
}

module.exports = {
  findById,
  findByUsername,
  findByEmail,
  create,
  update,
  remove,
  getUserStats,
  getUserGameTypeStats,
  getAllUserGameTypeStats
}