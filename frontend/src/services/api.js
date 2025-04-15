import logger from './logger'
import { ApiError, AuthError, ValidationError } from './error-handler'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
async function apiRequest(endpoint, options = {}) {
  const requestId = Math.random().toString(36).substring(2, 15)
  
  // Log the request
  logger.debug(`API Request [${requestId}]: ${options.method || 'GET'} ${endpoint}`, {
    requestId,
    endpoint,
    method: options.method || 'GET',
  })
  
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
    // In development, if we're accessing localhost, we'll mock the responses
    if (window.location.hostname === 'localhost') {
      return mockApiResponse(endpoint, options);
    }
      
    const startTime = performance.now()
    const response = await fetch(`${API_BASE}${endpoint}`, fetchOptions)
    const endTime = performance.now()
    
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      // Handle JSON parse error
      logger.error(`API Response not JSON [${requestId}]`, {
        requestId,
        status: response.status,
        statusText: response.statusText,
        error: parseError.message,
        duration: Math.round(endTime - startTime),
      })
      
      throw new ApiError(
        'Invalid server response format',
        response.status,
        'INVALID_RESPONSE'
      )
    }
    
    // Log the response
    logger.debug(`API Response [${requestId}]: ${response.status}`, {
      requestId,
      status: response.status,
      success: response.ok,
      duration: Math.round(endTime - startTime),
    })

    if (!response.ok) {
      // Map API errors to appropriate error types
      const errorMsg = data.error?.message || 'Something went wrong'
      const errorCode = data.error?.code || `ERR_${response.status}`
      const errorDetails = data.error?.details || []
      
      // Handle different error types
      if (response.status === 401 || response.status === 403) {
        throw new AuthError(errorMsg, errorCode)
      } else if (response.status === 400 && errorDetails.length > 0) {
        throw new ValidationError(errorMsg, errorDetails, errorCode)
      } else {
        throw new ApiError(errorMsg, response.status, errorCode, data.error)
      }
    }

    return data
  } catch (error) {
    // Don't double-wrap our own errors
    if (error instanceof ApiError || error instanceof AuthError || error instanceof ValidationError) {
      throw error
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      logger.error(`API Network Error [${requestId}]`, {
        requestId,
        endpoint,
        error: error.message,
      })
      
      throw new ApiError(
        'Network error, please check your connection',
        0,
        'NETWORK_ERROR'
      )
    }
    
    // Log other errors
    logger.error(`API Request Failed [${requestId}]`, {
      requestId,
      endpoint,
      error: error.message,
      stack: error.stack,
    })
    
    // Rethrow as ApiError
    throw new ApiError(
      error.message || 'API request failed',
      500,
      'API_ERROR'
    )
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
 * Mock API responses for localhost development without a backend
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Mocked API response
 */
function mockApiResponse(endpoint, options = {}) {
  // Add a delay to simulate network request
  return new Promise(resolve => {
    setTimeout(() => {
      // Mock responses based on endpoint
      switch (endpoint) {
        case '/users/me':
          resolve({
            success: true,
            data: {
              user: null // No authenticated user in demo mode
            }
          });
          break;
        
        case '/games/types':
          resolve({
            success: true,
            data: {
              types: [
                {
                  id: 1,
                  name: 'nim',
                  description: 'A mathematical game of strategy',
                  rules: JSON.stringify({
                    piles: [3, 5, 7],
                    removeMin: 1,
                    removeMax: null,
                    lastTakeWins: true
                  })
                },
                {
                  id: 2,
                  name: 'domineering',
                  description: 'A strategic game played on a grid',
                  rules: JSON.stringify({
                    width: 8,
                    height: 8,
                    player1Direction: 'horizontal',
                    player2Direction: 'vertical'
                  })
                }
              ]
            }
          });
          break;
          
        default:
          // Default response structure
          resolve({
            success: true,
            data: {
              message: 'Mock API response for endpoint: ' + endpoint
            }
          });
      }
    }, 500); // 500ms delay
  });
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