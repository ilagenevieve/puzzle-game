import { writable, derived, get } from 'svelte/store';

/**
 * Game state manager
 * Handles saving, loading, and syncing game state with localStorage and server
 */
class GameStateManager {
  constructor() {
    // Main game state store
    this.gameState = writable({
      currentGame: null,      // Current active game
      gameHistory: [],        // History of played games
      savedGames: {},         // Saved games by ID
      gameSettings: {
        difficulty: 'medium', // Game difficulty setting
        aiOpponent: false,    // AI opponent enabled
        sound: true,          // Sound effects enabled
        theme: 'ocean',       // Visual theme
        playerName: 'Player'  // User's display name
      },
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        winningStreak: 0
      },
      achievements: [],
      persistence: {
        localSaving: true,
        autoSave: true,
        syncWithServer: false,
        lastSynced: null
      }
    });
    
    // Initialize from localStorage if available
    this.initializeFromStorage();
    
    // Set up autosave
    this.setupAutosave();
    
    // Create derived stores for specific parts of state
    this.createDerivedStores();
  }
  
  /**
   * Initialize state from localStorage
   */
  initializeFromStorage() {
    try {
      // Check if localStorage is available
      if (typeof localStorage !== 'undefined') {
        const savedState = localStorage.getItem('oceanOfPuzzles_gameState');
        
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          this.gameState.set({
            ...get(this.gameState),
            ...parsedState
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load game state from localStorage:', error);
    }
  }
  
  /**
   * Set up autosave functionality
   */
  setupAutosave() {
    // Subscribe to state changes
    this.unsubscribe = this.gameState.subscribe(state => {
      if (state.persistence.autoSave && state.persistence.localSaving) {
        this.saveToStorage(state);
      }
    });
  }
  
  /**
   * Create derived stores for specific parts of state
   */
  createDerivedStores() {
    // Current game settings
    this.settings = derived(
      this.gameState,
      $state => $state.gameSettings
    );
    
    // Game statistics
    this.stats = derived(
      this.gameState,
      $state => $state.stats
    );
    
    // Current active game
    this.currentGame = derived(
      this.gameState,
      $state => $state.currentGame
    );
  }
  
  /**
   * Save state to localStorage
   * @param {Object} state - Current game state
   */
  saveToStorage(state) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('oceanOfPuzzles_gameState', JSON.stringify(state));
      }
    } catch (error) {
      console.warn('Failed to save game state to localStorage:', error);
    }
  }
  
  /**
   * Save current game
   * @param {string} gameId - Unique game ID
   * @param {Object} gameData - Game state data
   */
  saveGame(gameId, gameData) {
    this.gameState.update(state => {
      const savedGames = { ...state.savedGames };
      savedGames[gameId] = {
        ...gameData,
        savedAt: new Date().toISOString()
      };
      
      return {
        ...state,
        savedGames
      };
    });
    
    // Force save to storage
    const currentState = get(this.gameState);
    this.saveToStorage(currentState);
    
    return gameId;
  }
  
  /**
   * Load a saved game
   * @param {string} gameId - Game ID to load
   * @returns {Object} The loaded game data
   */
  loadGame(gameId) {
    const state = get(this.gameState);
    const game = state.savedGames[gameId];
    
    if (game) {
      // Set as current game
      this.gameState.update(state => ({
        ...state,
        currentGame: {
          id: gameId,
          ...game
        }
      }));
      
      return game;
    }
    
    return null;
  }
  
  /**
   * Delete a saved game
   * @param {string} gameId - Game ID to delete
   */
  deleteSavedGame(gameId) {
    this.gameState.update(state => {
      const savedGames = { ...state.savedGames };
      delete savedGames[gameId];
      
      return {
        ...state,
        savedGames
      };
    });
    
    // Force save to storage
    const currentState = get(this.gameState);
    this.saveToStorage(currentState);
  }
  
  /**
   * Start a new game
   * @param {string} gameType - Type of game (e.g., 'nim', 'domineering')
   * @param {Object} options - Game options
   * @returns {string} The new game ID
   */
  startNewGame(gameType, options = {}) {
    const gameId = `${gameType}_${Date.now()}`;
    
    const newGame = {
      id: gameId,
      type: gameType,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      completed: false,
      settings: {
        ...get(this.settings),
        ...options
      },
      state: {},
      moves: []
    };
    
    // Save to state
    this.gameState.update(state => ({
      ...state,
      currentGame: newGame
    }));
    
    return gameId;
  }
  
  /**
   * Record a move in the current game
   * @param {Object} moveData - Data about the move
   */
  recordMove(moveData) {
    this.gameState.update(state => {
      if (!state.currentGame) return state;
      
      const moves = [...state.currentGame.moves, {
        ...moveData,
        timestamp: Date.now()
      }];
      
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          moves,
          lastUpdated: new Date().toISOString()
        }
      };
    });
  }
  
  /**
   * Complete the current game
   * @param {Object} result - Game result data
   */
  completeGame(result) {
    this.gameState.update(state => {
      if (!state.currentGame) return state;
      
      // Create completed game
      const completedGame = {
        ...state.currentGame,
        completed: true,
        completedAt: new Date().toISOString(),
        result
      };
      
      // Add to history
      const gameHistory = [completedGame, ...state.gameHistory].slice(0, 50); // Keep last 50 games
      
      // Update stats
      const stats = { ...state.stats };
      stats.gamesPlayed++;
      
      if (result.won) {
        stats.gamesWon++;
        stats.winningStreak++;
      } else {
        stats.gamesLost++;
        stats.winningStreak = 0;
      }
      
      return {
        ...state,
        currentGame: null,
        gameHistory,
        stats
      };
    });
    
    // Force save to storage
    const currentState = get(this.gameState);
    this.saveToStorage(currentState);
  }
  
  /**
   * Update game settings
   * @param {Object} newSettings - New settings to apply
   */
  updateSettings(newSettings) {
    this.gameState.update(state => ({
      ...state,
      gameSettings: {
        ...state.gameSettings,
        ...newSettings
      }
    }));
  }
  
  /**
   * Get all saved games
   * @returns {Object} Map of saved games
   */
  getSavedGames() {
    const state = get(this.gameState);
    return state.savedGames;
  }
  
  /**
   * Get game history
   * @returns {Array} Array of completed games
   */
  getGameHistory() {
    const state = get(this.gameState);
    return state.gameHistory;
  }
  
  /**
   * Sync with server (placeholder)
   * @returns {Promise} Promise that resolves when sync is complete
   */
  async syncWithServer() {
    const state = get(this.gameState);
    
    if (!state.persistence.syncWithServer) {
      return { success: false, message: 'Server sync is disabled' };
    }
    
    try {
      // This would be replaced with actual API call
      console.log('Syncing with server...');
      
      // Update last synced timestamp
      this.gameState.update(state => ({
        ...state,
        persistence: {
          ...state.persistence,
          lastSynced: new Date().toISOString()
        }
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to sync with server:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Reset all game data
   */
  resetAllData() {
    // Confirm with user before resetting
    if (confirm('Are you sure you want to reset all game data? This cannot be undone.')) {
      this.gameState.set({
        currentGame: null,
        gameHistory: [],
        savedGames: {},
        gameSettings: {
          difficulty: 'medium',
          aiOpponent: false,
          sound: true,
          theme: 'ocean',
          playerName: 'Player'
        },
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          winningStreak: 0
        },
        achievements: [],
        persistence: {
          localSaving: true,
          autoSave: true,
          syncWithServer: false,
          lastSynced: null
        }
      });
      
      // Clear localStorage
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('oceanOfPuzzles_gameState');
        }
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// Create singleton instance
const gameStateManager = new GameStateManager();
export default gameStateManager;