import Phaser from 'phaser';
import { writable } from 'svelte/store';
import gameStateManager from './GameStateManager';
import logger from '../services/logger';
import { GameError } from '../services/error-handler';

// Import scenes
import TestScene from './scenes/TestScene';
import NimGame from './scenes/NimGame';

// Create a game-specific logger
const gameLogger = logger.child({ module: 'GameManager' });

/**
 * GameManager class
 * Handles scene management, game state, and interactions with the Phaser instance
 */
class GameManager {
  constructor() {
    this.game = null;
    this.config = null;
    this.scenes = [
      TestScene,
      NimGame,
      // Add more scenes here as they are created
    ];
    
    // Create a store for game state that components can subscribe to
    this.state = writable({
      initialized: false,
      currentScene: null,
      loading: false,
      error: null
    });
    
    // Reference to the game state manager
    this.gameStateManager = gameStateManager;
  }

  /**
   * Initialize the game with a Phaser instance
   * @param {Phaser.Game} game - Phaser game instance
   * @param {Object} config - Game configuration
   */
  init(game, config = {}) {
    if (!game) {
      const errorMessage = 'Game instance is required';
      gameLogger.error(errorMessage);
      this.updateState({ error: errorMessage });
      return false;
    }
    
    gameLogger.info('Initializing game manager', { config });
    
    this.game = game;
    this.config = config;
    
    try {
      // Add all scenes
      this.addScenes();
      
      // Update state
      this.updateState({ 
        initialized: true,
        loading: false
      });
      
      gameLogger.info('Game manager initialized successfully');
      return true;
    } catch (error) {
      const errorMessage = 'Failed to initialize game';
      gameLogger.error(errorMessage, { error });
      
      this.updateState({ 
        initialized: false,
        error: errorMessage
      });
      
      return false;
    }
  }
  
  /**
   * Add all scenes to the game
   */
  addScenes() {
    if (!this.game) return;
    
    // First remove any existing scenes
    this.scenes.forEach(SceneClass => {
      if (this.game.scene.getScene(SceneClass.name)) {
        this.game.scene.remove(SceneClass.name);
      }
    });
    
    // Now add all scenes
    this.scenes.forEach(SceneClass => {
      this.game.scene.add(SceneClass.name, SceneClass);
    });
  }

  /**
   * Start a scene
   * @param {string} sceneName - Name of the scene to start
   * @param {Object} data - Data to pass to the scene
   */
  startScene(sceneName, data = {}) {
    if (!this.game) {
      const errorMessage = 'Game not initialized';
      gameLogger.error(errorMessage);
      this.updateState({ error: errorMessage });
      throw new GameError(errorMessage, null, 'GAME_NOT_INITIALIZED');
    }
    
    if (!this.game.scene.getScene(sceneName)) {
      const errorMessage = `Scene "${sceneName}" not found`;
      gameLogger.error(errorMessage);
      this.updateState({ error: errorMessage });
      throw new GameError(errorMessage, null, 'SCENE_NOT_FOUND');
    }
    
    gameLogger.info(`Starting scene: ${sceneName}`, { sceneName, data });
    
    // Stop all scenes first
    this.game.scene.scenes.forEach(scene => {
      if (scene.scene.isActive()) {
        gameLogger.debug(`Stopping scene: ${scene.scene.key}`);
        scene.scene.stop();
      }
    });
    
    // Update state
    this.updateState({ 
      loading: true,
      currentScene: sceneName
    });
    
    // Start the requested scene
    try {
      this.game.scene.start(sceneName, data);
      
      // Update state after scene starts
      this.updateState({ loading: false });
      gameLogger.info(`Scene started successfully: ${sceneName}`);
      
    } catch (error) {
      const errorMessage = `Failed to start scene: ${error.message}`;
      gameLogger.error(`Error starting scene ${sceneName}:`, { 
        sceneName, 
        error: error.message,
        stack: error.stack
      });
      
      this.updateState({ 
        error: errorMessage,
        loading: false
      });
      
      throw new GameError(errorMessage, null, 'SCENE_START_ERROR', {
        sceneName,
        originalError: error.message
      });
    }
  }

  /**
   * Get a reference to a specific scene
   * @param {string} sceneName - Name of the scene to get
   * @returns {Phaser.Scene} The requested scene
   */
  getScene(sceneName) {
    if (!this.game) return null;
    return this.game.scene.getScene(sceneName);
  }

  /**
   * Update the state store
   * @param {Object} newState - New state to merge with existing state
   */
  updateState(newState) {
    this.state.update(state => ({
      ...state,
      ...newState
    }));
  }

  /**
   * Restart the current scene
   */
  restartCurrentScene() {
    let currentScene = null;
    
    this.state.subscribe(state => {
      currentScene = state.currentScene;
    })();
    
    if (currentScene) {
      this.startScene(currentScene);
    }
  }

  /**
   * Get the current game
   * @returns {Phaser.Game} The current Phaser game instance
   */
  getGame() {
    return this.game;
  }
  
  /**
   * Start a test scene for development
   */
  startTestScene() {
    this.startScene('TestScene');
  }
  
  /**
   * Start the Nim game
   * @param {Object} options - Game options
   */
  startNimGame(options = {}) {
    // Default options
    const defaultOptions = {
      heaps: [3, 5, 7, 9],
      playerNames: ['Player 1', 'Player 2'],
      aiOpponent: false,
      aiDifficulty: 'medium'
    };
    
    // Merge with provided options
    const gameOptions = { ...defaultOptions, ...options };
    
    // Create a new game in the state manager
    const gameId = this.gameStateManager.startNewGame('nim', gameOptions);
    
    // Start the scene
    this.startScene('NimGame', { ...gameOptions, gameId });
    
    return gameId;
  }
  
  /**
   * Resume a saved game
   * @param {string} gameId - ID of the saved game to resume
   * @returns {boolean} True if game was resumed successfully
   */
  resumeGame(gameId) {
    // Load the game from state manager
    const gameData = this.gameStateManager.loadGame(gameId);
    
    if (!gameData) {
      this.updateState({ 
        error: `Game with ID ${gameId} not found` 
      });
      return false;
    }
    
    // Determine which scene to start based on game type
    let sceneName;
    switch (gameData.type) {
      case 'nim':
        sceneName = 'NimGame';
        break;
      // Add cases for other game types here
      default:
        sceneName = 'TestScene';
    }
    
    // Start the scene with the loaded game data
    this.startScene(sceneName, { 
      ...gameData.settings, 
      gameId, 
      loadedGame: true,
      gameState: gameData.state,
      moves: gameData.moves
    });
    
    return true;
  }
  
  /**
   * Clean up and destroy the game
   */
  destroy() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      
      this.updateState({
        initialized: false,
        currentScene: null,
        loading: false
      });
    }
  }
}

// Create singleton instance
const gameManager = new GameManager();
export default gameManager;