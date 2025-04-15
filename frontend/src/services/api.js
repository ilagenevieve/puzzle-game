const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
async function apiRequest(endpoint, options = {}) {
  // Default options for all requests
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
  }

  // Merge options
  const fetchOptions = { ...defaultOptions, ...options }
  
  // For POST/PUT requests with bodies, ensure body is JSON
  if (fetchOptions.body && typeof fetchOptions.body === 'object') {
    fetchOptions.body = JSON.stringify(fetchOptions.body)
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, fetchOptions)
    const data = await response.json()

    if (!response.ok) {
      // Format error consistently with message from server or fallback
      const errorMsg = data.error?.message || 'Something went wrong'
      throw new Error(errorMsg)
    }

    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

/**
 * Authentication API functions
 */

// Register new user
export async function register(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  })
}

// Login existing user
export async function login(username, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { username, password },
  })
}

// Logout current user
export async function logout() {
  return apiRequest('/auth/logout', {
    method: 'POST',
  })
}

// Get current authenticated user
export async function getCurrentUser() {
  try {
    return await apiRequest('/users/me')
  } catch (error) {
    // Not authenticated is a valid state, not an error to be thrown
    if (error.message.includes('Unauthorized') || error.message.includes('Authentication')) {
      return null
    }
    throw error
  }
}

// Update user profile
export async function updateUserProfile(profileData) {
  return apiRequest('/users/profile', {
    method: 'PUT',
    body: profileData,
  })
}

// Change user password
export async function changePassword(passwordData) {
  return apiRequest('/users/password', {
    method: 'PUT',
    body: passwordData,
  })
}

/**
 * Game API functions
 */

// Get all available game types
export async function getGameTypes() {
  return apiRequest('/games/types')
}

// Get a specific game by ID
export async function getGame(gameId) {
  return apiRequest(`/games/${gameId}`)
}

// Create a new game
export async function createGame(gameTypeId) {
  return apiRequest('/games', {
    method: 'POST',
    body: { gameTypeId },
  })
}

// Make a move in a game
export async function makeMove(gameId, moveData) {
  return apiRequest(`/games/${gameId}/move`, {
    method: 'POST',
    body: { move: moveData },
  })
}

// Get user stats
export async function getUserStats() {
  return apiRequest('/users/stats')
}

/**
 * Multiplayer functions
 */

// Create a new game invitation
export async function createGameInvitation(gameTypeId) {
  return apiRequest('/games/invitation', {
    method: 'POST',
    body: { gameTypeId },
  })
}

// Accept a game invitation
export async function acceptGameInvitation(invitationId) {
  return apiRequest(`/games/invitation/${invitationId}/accept`, {
    method: 'POST',
  })
}

// Decline a game invitation
export async function declineGameInvitation(invitationId) {
  return apiRequest(`/games/invitation/${invitationId}/decline`, {
    method: 'POST',
  })
}