import Phaser from 'phaser';
import { writable } from 'svelte/store';
import gameStateManager from './GameStateManager';

// Import scenes
import TestScene from './scenes/TestScene';
import NimGame from './scenes/NimGame';

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
      this.updateState({ error: 'Game instance is required' });
      return false;
    }
    
    this.game = game;
    this.config = config;
    
    // Add all scenes
    this.addScenes();
    
    // Update state
    this.updateState({ 
      initialized: true,
      loading: false
    });
    
    return true;
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
      this.updateState({ error: 'Game not initialized' });
      return;
    }
    
    // Stop all scenes first
    this.game.scene.scenes.forEach(scene => {
      if (scene.scene.isActive()) {
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
      
    } catch (error) {
      console.error(`Error starting scene ${sceneName}:`, error);
      this.updateState({ 
        error: `Failed to start scene: ${error.message}`,
        loading: false
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