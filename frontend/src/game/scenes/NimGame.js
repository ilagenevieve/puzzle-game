import BaseScene from './BaseScene';
import NimBoard from '../board/NimBoard';
import AssetLoader from '../assets/AssetLoader';
import { NimAssets, CommonAssets, SoundAssets } from '../assets/AssetManifest';

/**
 * NimGame scene
 * Implements the Nim game
 */
export default class NimGame extends BaseScene {
  /**
   * Create a new Nim game scene
   */
  constructor() {
    super('NimGame');
    
    this.board = null;
    this.gameUI = null;
    this.assetsLoaded = false;
    this.gameStarted = false;
    this.currentPlayer = 1;
    this.winner = null;
  }
  
  /**
   * Initialize game with data
   * @param {Object} data - Scene initialization data
   */
  init(data) {
    super.init(data);
    
    // Game options
    this.gameOptions = {
      nimHeaps: data.heaps || [3, 5, 7, 9],
      playerNames: data.playerNames || ['Player 1', 'Player 2'],
      aiOpponent: data.aiOpponent || false,
      aiDifficulty: data.aiDifficulty || 'medium',
      timeLimit: data.timeLimit || 0,
      ...data
    };
    
    // Initialize asset loader
    this.assetLoader = new AssetLoader(this);
    this.assetLoader.registerAssets('nim', NimAssets);
    this.assetLoader.registerAssets('common', CommonAssets);
    this.assetLoader.registerAssets('sound', SoundAssets);
  }
  
  /**
   * Preload assets needed for this scene
   */
  preload() {
    super.preload();
    
    // Load all required assets
    this.assetLoader.loadAll(['nim', 'common', 'sound'])
      .then(() => {
        this.assetsLoaded = true;
        if (this.loadingText) {
          this.loadingText.destroy();
          this.loadingText = null;
        }
      })
      .catch(error => {
        console.error('Failed to load assets:', error);
        this.showError('Asset loading failed. Please try again.');
      });
  }
  
  /**
   * Create game objects
   */
  create() {
    super.create();
    
    // Check if assets are loaded
    if (!this.assetsLoaded) {
      this.events.once('assetsLoaded', () => this.setupGame());
    } else {
      this.setupGame();
    }
  }
  
  /**
   * Set up the game after assets are loaded
   */
  setupGame() {
    // Create background
    this.createGameBackground();
    
    // Create the Nim board
    this.createBoard();
    
    // Create UI elements
    this.createGameUI();
    
    // Setup event listeners
    this.setupEvents();
    
    // Start game
    this.startGame();
  }
  
  /**
   * Create game background
   */
  createGameBackground() {
    // Use ocean background if available, otherwise use a gradient
    if (this.textures.exists('ocean-background')) {
      const bg = this.add.image(this.centerX, this.centerY, 'ocean-background')
        .setDisplaySize(this.width, this.height);
      bg.setDepth(-10);
    } else {
      // Fallback to gradient background
      super.createBackground();
    }
    
    // Add wave overlay if available
    if (this.textures.exists('wave-overlay')) {
      const waves = this.add.image(this.centerX, this.height - 100, 'wave-overlay')
        .setDisplaySize(this.width, 200)
        .setAlpha(0.3);
      waves.setDepth(-5);
      
      // Animate waves
      this.tweens.add({
        targets: waves,
        x: { from: 0, to: this.width },
        duration: 20000,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }
  
  /**
   * Create the Nim board
   */
  createBoard() {
    // Calculate board size based on screen dimensions
    const maxWidth = this.width * 0.8;
    const maxHeight = this.height * 0.6;
    
    // Calculate cell size
    const totalCells = Math.max(...this.gameOptions.nimHeaps);
    const maxCellSize = Math.min(
      maxWidth / totalCells,
      maxHeight / this.gameOptions.nimHeaps.length
    );
    
    // Create board
    this.board = new NimBoard(this, {
      rows: this.gameOptions.nimHeaps.length,
      columns: totalCells,
      nimHeaps: this.gameOptions.nimHeaps,
      cellSize: maxCellSize,
      position: {
        x: this.centerX,
        y: this.centerY
      },
      boardColor: 0x1a4562,
      objectScale: 0.7,
      debugMode: false
    });
  }
  
  /**
   * Create game UI
   */
  createGameUI() {
    this.gameUI = this.add.container(0, 0);
    
    // Create title
    this.titleText = this.add.text(
      this.centerX,
      50,
      'Ocean of Puzzles: Nim',
      {
        fontFamily: 'Arial',
        fontSize: 32,
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        stroke: '#103554',
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    this.gameUI.add(this.titleText);
    
    // Create player info displays
    this.createPlayerInfo();
    
    // Create control buttons
    this.createControls();
  }
  
  /**
   * Create player information displays
   */
  createPlayerInfo() {
    const yPosition = this.height - 80;
    
    // Player 1 info (left)
    this.player1Container = this.add.container(150, yPosition);
    
    const player1Bg = this.add.graphics();
    player1Bg.fillStyle(0x2196f3, 0.7);
    player1Bg.fillRoundedRect(-120, -30, 240, 60, 10);
    
    const player1Text = this.add.text(
      0,
      0,
      this.gameOptions.playerNames[0],
      {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    this.player1Container.add([player1Bg, player1Text]);
    this.gameUI.add(this.player1Container);
    
    // Player 2 info (right)
    this.player2Container = this.add.container(this.width - 150, yPosition);
    
    const player2Bg = this.add.graphics();
    player2Bg.fillStyle(0xff5722, 0.7);
    player2Bg.fillRoundedRect(-120, -30, 240, 60, 10);
    
    const player2Text = this.add.text(
      0,
      0,
      this.gameOptions.playerNames[1],
      {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    this.player2Container.add([player2Bg, player2Text]);
    this.gameUI.add(this.player2Container);
    
    // Active player indicator
    this.activeIndicator = this.add.graphics();
    this.activeIndicator.fillStyle(0xffffff, 1);
    this.activeIndicator.fillCircle(0, 0, 15);
    
    // Add to UI
    this.gameUI.add(this.activeIndicator);
    
    // Update indicator position based on current player
    this.updatePlayerIndicator();
  }
  
  /**
   * Create game control buttons
   */
  createControls() {
    // Reset game button
    this.resetButton = this.createButton(
      this.centerX,
      this.height - 80,
      'Reset Game',
      () => this.resetGame(),
      {
        backgroundColor: 0x103554,
        backgroundColorHover: 0x1a4562,
        width: 180,
        height: 50
      }
    );
    this.gameUI.add(this.resetButton);
    
    // Hint button
    this.hintButton = this.createButton(
      this.centerX + 200,
      this.height - 80,
      'Hint',
      () => this.showHint(),
      {
        backgroundColor: 0x2e7d32,
        backgroundColorHover: 0x388e3c,
        width: 120,
        height: 50
      }
    );
    this.gameUI.add(this.hintButton);
  }
  
  /**
   * Setup game event listeners
   */
  setupEvents() {
    // Listen for board events
    this.events.on('playerChanged', player => {
      this.currentPlayer = player;
      this.updatePlayerIndicator();
      
      // If AI opponent and it's AI's turn
      if (this.gameOptions.aiOpponent && this.currentPlayer === 2) {
        this.makeAIMove();
      }
    }, this);
    
    this.events.on('gameOver', data => {
      this.handleGameOver(data.winner);
    }, this);
    
    this.events.on('boardReset', () => {
      this.currentPlayer = 1;
      this.winner = null;
      this.updatePlayerIndicator();
      this.hideGameOverMessage();
    }, this);
  }
  
  /**
   * Start the game
   */
  startGame() {
    this.gameStarted = true;
    this.currentPlayer = 1;
    this.winner = null;
    
    // Show start message
    this.showMessage('Game started! Player 1 goes first.');
    
    // Play start sound
    if (this.sound.get('splash')) {
      this.sound.play('splash', { volume: 0.5 });
    }
  }
  
  /**
   * Update player indicator
   */
  updatePlayerIndicator() {
    // Position indicator near the active player
    if (this.currentPlayer === 1) {
      this.activeIndicator.x = this.player1Container.x - 140;
      this.activeIndicator.y = this.player1Container.y;
      
      // Update styles
      this.player1Container.alpha = 1;
      this.player2Container.alpha = 0.7;
    } else {
      this.activeIndicator.x = this.player2Container.x - 140;
      this.activeIndicator.y = this.player2Container.y;
      
      // Update styles
      this.player1Container.alpha = 0.7;
      this.player2Container.alpha = 1;
    }
  }
  
  /**
   * Make AI move
   */
  makeAIMove() {
    // Delay AI move for more natural gameplay
    this.time.delayedCall(1500, () => {
      if (!this.board || this.winner !== null) return;
      
      // Get board state
      const state = this.board.getBoardState();
      
      // Get a hint (optimal move)
      const hint = this.board.createHint();
      
      // Make the move
      if (hint && hint.moves && hint.moves.length > 0) {
        const move = hint.moves[0];
        const row = move.row;
        
        // Find the first active object in the row
        let col = 0;
        for (let c = 0; c < state.heaps[row]; c++) {
          if (state.cells[row][c].value === 1) {
            col = c;
            break;
          }
        }
        
        // Determine how many objects to remove
        const count = move.count;
        const targetCol = Math.max(0, state.heaps[row] - count);
        
        // Pretend to think by simulating clicks
        this.aiMakeMoveAtPosition(row, targetCol);
      } else {
        // Fallback to random move
        this.makeRandomMove();
      }
    });
  }
  
  /**
   * Simulate AI clicking at a position
   */
  aiMakeMoveAtPosition(row, col) {
    if (!this.board || this.winner !== null) return;
    
    // Get cell position
    if (this.board.objectSprites[row] && this.board.objectSprites[row][col]) {
      const cell = this.board.objectSprites[row][col];
      
      // Simulate click
      this.board.onObjectClick(row, col);
      
      // Play sound effect
      if (this.sound.get('click')) {
        this.sound.play('click', { volume: 0.5 });
      }
    }
  }
  
  /**
   * Make a random move (fallback)
   */
  makeRandomMove() {
    if (!this.board || this.winner !== null) return;
    
    // Get board state
    const state = this.board.getBoardState();
    
    // Find rows with objects
    const availableRows = [];
    for (let row = 0; row < state.heaps.length; row++) {
      if (state.heaps[row] > 0) {
        availableRows.push(row);
      }
    }
    
    if (availableRows.length === 0) return;
    
    // Pick a random row
    const randomRow = availableRows[Math.floor(Math.random() * availableRows.length)];
    const heapSize = state.heaps[randomRow];
    
    // Decide how many to remove (1 to all)
    const removeCount = Math.floor(Math.random() * heapSize) + 1;
    const targetCol = heapSize - removeCount;
    
    // Make the move
    this.aiMakeMoveAtPosition(randomRow, targetCol);
  }
  
  /**
   * Handle game over
   * @param {number} winner - The winning player (0 for draw)
   */
  handleGameOver(winner) {
    this.winner = winner;
    
    // Show game over message
    if (winner === 0) {
      this.showGameOverMessage('Game Over', 'It\'s a draw!');
    } else {
      const winnerName = this.gameOptions.playerNames[winner - 1];
      this.showGameOverMessage('Game Over', `${winnerName} wins!`);
      
      // Play appropriate sound
      if (this.sound.get('win')) {
        this.sound.play('win', { volume: 0.5 });
      }
    }
  }
  
  /**
   * Show game over message
   * @param {string} title - Message title
   * @param {string} message - Message content
   */
  showGameOverMessage(title, message) {
    // Create container for game over message
    this.gameOverContainer = this.add.container(this.centerX, this.centerY - 50);
    this.gameOverContainer.setDepth(100);
    
    // Add background
    const bg = this.add.graphics();
    bg.fillStyle(0x103554, 0.9);
    bg.fillRoundedRect(-200, -100, 400, 250, 20);
    this.gameOverContainer.add(bg);
    
    // Add title
    const titleText = this.add.text(
      0,
      -60,
      title,
      {
        fontFamily: 'Arial',
        fontSize: 32,
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    this.gameOverContainer.add(titleText);
    
    // Add message
    const messageText = this.add.text(
      0,
      0,
      message,
      {
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    this.gameOverContainer.add(messageText);
    
    // Add play again button
    const playAgainButton = this.createButton(
      0,
      70,
      'Play Again',
      () => this.resetGame(),
      {
        width: 200,
        height: 50,
        fontSize: 20
      }
    );
    this.gameOverContainer.add(playAgainButton);
    
    // Add animation
    this.tweens.add({
      targets: this.gameOverContainer,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });
  }
  
  /**
   * Hide game over message
   */
  hideGameOverMessage() {
    if (this.gameOverContainer) {
      this.tweens.add({
        targets: this.gameOverContainer,
        alpha: 0,
        scale: 0.5,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => {
          this.gameOverContainer.destroy();
          this.gameOverContainer = null;
        }
      });
    }
  }
  
  /**
   * Show a temporary message
   * @param {string} text - Message text
   * @param {number} duration - Duration in milliseconds
   */
  showMessage(text, duration = 3000) {
    // Remove existing message if any
    if (this.messageText) {
      this.messageText.destroy();
    }
    
    // Create message text
    this.messageText = this.add.text(
      this.centerX,
      120,
      text,
      {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        backgroundColor: '#103554',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Add animation
    this.tweens.add({
      targets: this.messageText,
      y: { from: 100, to: 120 },
      alpha: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Auto hide after duration
    this.time.delayedCall(duration, () => {
      if (this.messageText) {
        this.tweens.add({
          targets: this.messageText,
          alpha: 0,
          y: 100,
          duration: 300,
          ease: 'Back.easeIn',
          onComplete: () => {
            if (this.messageText) {
              this.messageText.destroy();
              this.messageText = null;
            }
          }
        });
      }
    });
  }
  
  /**
   * Show an error message
   * @param {string} text - Error message
   */
  showError(text) {
    this.showMessage(`Error: ${text}`, 5000);
  }
  
  /**
   * Show a hint
   */
  showHint() {
    if (!this.board || this.winner !== null) return;
    
    // Get hint from board
    const hint = this.board.createHint();
    
    if (hint) {
      this.showMessage(hint.message, 5000);
    }
  }
  
  /**
   * Reset the game
   */
  resetGame() {
    if (!this.board) return;
    
    // Reset the board
    this.board.resetBoard();
    
    // Reset game state
    this.gameStarted = true;
    this.currentPlayer = 1;
    this.winner = null;
    
    // Update UI
    this.updatePlayerIndicator();
    
    // Show message
    this.showMessage('Game reset! Player 1 goes first.');
    
    // Play sound
    if (this.sound.get('splash')) {
      this.sound.play('splash', { volume: 0.5 });
    }
  }
  
  /**
   * Handle resize events
   * @param {Object} gameSize - New game size
   */
  onResize(gameSize) {
    super.onResize(gameSize);
    
    // Resize board if it exists
    if (this.board) {
      this.board.resize(gameSize.width, gameSize.height);
    }
  }
  
  /**
   * Update layout of UI elements
   */
  updateLayout() {
    super.updateLayout();
    
    if (this.titleText) {
      this.titleText.setPosition(this.centerX, 50);
    }
    
    if (this.player1Container) {
      this.player1Container.setPosition(150, this.height - 80);
    }
    
    if (this.player2Container) {
      this.player2Container.setPosition(this.width - 150, this.height - 80);
    }
    
    if (this.resetButton) {
      this.resetButton.setPosition(this.centerX, this.height - 80);
    }
    
    if (this.hintButton) {
      this.hintButton.setPosition(this.centerX + 200, this.height - 80);
    }
    
    if (this.gameOverContainer) {
      this.gameOverContainer.setPosition(this.centerX, this.centerY - 50);
    }
    
    if (this.messageText) {
      this.messageText.setPosition(this.centerX, 120);
    }
    
    // Update player indicator
    this.updatePlayerIndicator();
  }
  
  /**
   * Game update loop
   * @param {number} time - Current time
   * @param {number} delta - Time since last update
   */
  update(time, delta) {
    // Handle any per-frame updates here
    
    // If AI is enabled and it's AI's turn, make a move
    if (this.gameStarted && 
        this.gameOptions.aiOpponent && 
        this.currentPlayer === 2 && 
        !this.winner && 
        !this.board.isLoading) {
      // Note: AI moves are handled by events, not in update loop
    }
  }
}