/**
 * BoardEngine class
 * Provides a generic board system that can be customized for different games
 */
export default class BoardEngine {
  /**
   * Create a new board engine
   * @param {Phaser.Scene} scene - The Phaser scene this board is attached to
   * @param {Object} config - Configuration options for the board
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    
    // Default configuration
    const defaultConfig = {
      rows: 3,
      columns: 3,
      cellSize: 80,
      cellPadding: 10,
      boardColor: 0x2b608f,
      cellColor: 0x1a4562,
      highlightColor: 0x4a9be8,
      position: {
        x: scene.cameras.main.centerX,
        y: scene.cameras.main.centerY
      },
      style: 'grid', // 'grid', 'hex', or 'custom'
      interactive: true,
      debugMode: false
    };
    
    // Merge provided config with defaults
    this.config = { ...defaultConfig, ...config };
    
    // Game state
    this.state = {
      cells: [],  // Will hold cell data
      currentPlayer: 1,
      selectedCell: null,
      moves: [],
      gameOver: false,
      winner: null
    };
    
    // Create display objects
    this.displayGroup = scene.add.group();
    this.boardContainer = scene.add.container(
      this.config.position.x,
      this.config.position.y
    );
    
    // Initialize the board
    this.initializeBoard();
  }
  
  /**
   * Initialize the board structure
   */
  initializeBoard() {
    // Create background
    this.createBoardBackground();
    
    // Create cells based on board type
    switch (this.config.style) {
      case 'hex':
        this.createHexBoard();
        break;
      case 'custom':
        // For custom board layouts
        this.createCustomBoard();
        break;
      case 'grid':
      default:
        this.createGridBoard();
        break;
    }
    
    // Initialize cell data
    this.initializeCellData();
    
    // Make cells interactive if needed
    if (this.config.interactive) {
      this.setupInteractivity();
    }
    
    // Show debug info if enabled
    if (this.config.debugMode) {
      this.showDebugInfo();
    }
  }
  
  /**
   * Create the board background
   */
  createBoardBackground() {
    // Calculate board dimensions
    const width = (this.config.columns * this.config.cellSize) + 
                  ((this.config.columns + 1) * this.config.cellPadding);
    const height = (this.config.rows * this.config.cellSize) + 
                   ((this.config.rows + 1) * this.config.cellPadding);
    
    // Create rounded rectangle for the board
    const background = this.scene.add.graphics();
    background.fillStyle(this.config.boardColor, 1);
    background.fillRoundedRect(
      -width / 2, 
      -height / 2, 
      width, 
      height, 
      10
    );
    
    // Add to container
    this.boardContainer.add(background);
    this.background = background;
    
    // Store dimensions for later use
    this.boardWidth = width;
    this.boardHeight = height;
  }
  
  /**
   * Create a standard grid board
   */
  createGridBoard() {
    const cellSize = this.config.cellSize;
    const padding = this.config.cellPadding;
    const startX = -(this.boardWidth / 2) + padding + (cellSize / 2);
    const startY = -(this.boardHeight / 2) + padding + (cellSize / 2);
    
    // Create cells
    this.cellSprites = [];
    
    for (let row = 0; row < this.config.rows; row++) {
      this.cellSprites[row] = [];
      
      for (let col = 0; col < this.config.columns; col++) {
        // Calculate position
        const x = startX + (col * (cellSize + padding));
        const y = startY + (row * (cellSize + padding));
        
        // Create cell
        const cell = this.createCell(x, y, row, col);
        this.cellSprites[row][col] = cell;
      }
    }
  }
  
  /**
   * Create a hexagonal grid board
   */
  createHexBoard() {
    const cellSize = this.config.cellSize;
    const hexHeight = cellSize * 2;
    const hexWidth = Math.sqrt(3) * cellSize;
    const padding = this.config.cellPadding;
    
    const startX = -(this.boardWidth / 2) + padding + (hexWidth / 2);
    const startY = -(this.boardHeight / 2) + padding + (hexHeight / 2);
    
    // Create cells
    this.cellSprites = [];
    
    for (let row = 0; row < this.config.rows; row++) {
      this.cellSprites[row] = [];
      
      for (let col = 0; col < this.config.columns; col++) {
        // Calculate position with offset for hex grid
        const offset = row % 2 === 0 ? 0 : hexWidth / 2;
        const x = startX + offset + (col * (hexWidth + padding));
        const y = startY + (row * (hexHeight * 0.75 + padding));
        
        // Create hex cell
        const cell = this.createHexCell(x, y, row, col);
        this.cellSprites[row][col] = cell;
      }
    }
  }
  
  /**
   * Create a custom board layout
   * Override this method for custom board layouts
   */
  createCustomBoard() {
    // This is a placeholder for custom board layouts
    console.log('Custom board layout not implemented');
    
    // Fallback to grid board
    this.createGridBoard();
  }
  
  /**
   * Create a standard cell for grid boards
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {Phaser.GameObjects.Container} The cell container
   */
  createCell(x, y, row, col) {
    const cellSize = this.config.cellSize;
    
    // Create container
    const container = this.scene.add.container(x, y);
    this.boardContainer.add(container);
    
    // Create cell background
    const background = this.scene.add.graphics();
    background.fillStyle(this.config.cellColor, 1);
    background.fillRoundedRect(
      -cellSize / 2, 
      -cellSize / 2, 
      cellSize, 
      cellSize, 
      5
    );
    container.add(background);
    
    // Add text for coordinates if debug mode is on
    if (this.config.debugMode) {
      const text = this.scene.add.text(
        0, 
        0, 
        `${row},${col}`, 
        {
          fontFamily: 'Arial',
          fontSize: 14,
          color: '#ffffff'
        }
      ).setOrigin(0.5);
      container.add(text);
    }
    
    // Store references
    container.cellBackground = background;
    container.row = row;
    container.col = col;
    
    return container;
  }
  
  /**
   * Create a hexagonal cell for hex boards
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {Phaser.GameObjects.Container} The cell container
   */
  createHexCell(x, y, row, col) {
    const cellSize = this.config.cellSize;
    
    // Create container
    const container = this.scene.add.container(x, y);
    this.boardContainer.add(container);
    
    // Create hex background
    const background = this.scene.add.graphics();
    background.fillStyle(this.config.cellColor, 1);
    
    // Draw hexagon
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle = Phaser.Math.PI2 / 6 * i + Math.PI / 6;
      const px = Math.cos(angle) * cellSize;
      const py = Math.sin(angle) * cellSize;
      hexPoints.push(new Phaser.Math.Vector2(px, py));
    }
    
    background.fillPoints(hexPoints, true);
    container.add(background);
    
    // Add text for coordinates if debug mode is on
    if (this.config.debugMode) {
      const text = this.scene.add.text(
        0, 
        0, 
        `${row},${col}`, 
        {
          fontFamily: 'Arial',
          fontSize: 14,
          color: '#ffffff'
        }
      ).setOrigin(0.5);
      container.add(text);
    }
    
    // Store references
    container.cellBackground = background;
    container.row = row;
    container.col = col;
    
    return container;
  }
  
  /**
   * Initialize cell data structure
   */
  initializeCellData() {
    this.state.cells = Array(this.config.rows).fill().map(() => 
      Array(this.config.columns).fill().map(() => ({
        value: 0,  // 0 = empty, 1 = player 1, 2 = player 2, etc.
        highlighted: false,
        selectable: true
      }))
    );
  }
  
  /**
   * Setup interactivity for cells
   */
  setupInteractivity() {
    // Add interactivity to each cell
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.columns; col++) {
        const cell = this.cellSprites[row][col];
        
        // Make interactive
        cell.setInteractive({ useHandCursor: true })
          .on('pointerover', () => this.onCellOver(row, col))
          .on('pointerout', () => this.onCellOut(row, col))
          .on('pointerdown', () => this.onCellClick(row, col));
      }
    }
  }
  
  /**
   * Handle cell hover
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  onCellOver(row, col) {
    // Only highlight if cell is selectable
    if (this.state.cells[row][col].selectable && !this.state.gameOver) {
      this.highlightCell(row, col, true);
    }
  }
  
  /**
   * Handle cell hover end
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  onCellOut(row, col) {
    // Only remove highlight if not selected
    if (!this.state.cells[row][col].highlighted) {
      this.highlightCell(row, col, false);
    }
  }
  
  /**
   * Handle cell click
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  onCellClick(row, col) {
    // Check if the move is valid
    if (this.isValidMove(row, col)) {
      // Make the move
      this.makeMove(row, col);
      
      // Emit move event
      this.scene.events.emit('cellSelected', { row, col, player: this.state.currentPlayer });
    }
  }
  
  /**
   * Check if a move is valid
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {boolean} True if the move is valid
   */
  isValidMove(row, col) {
    // Basic validation - cell is empty and game is not over
    return (
      !this.state.gameOver &&
      this.state.cells[row][col].value === 0 &&
      this.state.cells[row][col].selectable
    );
  }
  
  /**
   * Make a move
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  makeMove(row, col) {
    // Update cell value
    this.state.cells[row][col].value = this.state.currentPlayer;
    
    // Visualize the move
    this.visualizeMove(row, col);
    
    // Add to move history
    this.state.moves.push({
      row,
      col,
      player: this.state.currentPlayer
    });
    
    // Check for game end conditions
    this.checkGameEnd();
    
    // Switch player if game is not over
    if (!this.state.gameOver) {
      this.switchPlayer();
    }
  }
  
  /**
   * Visualize a move on the board
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  visualizeMove(row, col) {
    const cell = this.cellSprites[row][col];
    const player = this.state.currentPlayer;
    const cellSize = this.config.cellSize * 0.7; // Slightly smaller than the cell
    
    // Clear existing content
    const existingPiece = cell.getByName('piece');
    if (existingPiece) {
      existingPiece.destroy();
    }
    
    // Create player piece
    const piece = this.scene.add.graphics({ name: 'piece' });
    
    // Different styles for different players
    const playerColors = [
      0x2196f3, // Player 1 - Blue
      0xff5722  // Player 2 - Orange
    ];
    
    piece.fillStyle(playerColors[player - 1], 1);
    
    // Draw player piece
    if (this.config.style === 'hex') {
      // Hexagonal piece
      const hexPoints = [];
      const size = cellSize * 0.5;
      for (let i = 0; i < 6; i++) {
        const angle = Phaser.Math.PI2 / 6 * i + Math.PI / 6;
        const px = Math.cos(angle) * size;
        const py = Math.sin(angle) * size;
        hexPoints.push(new Phaser.Math.Vector2(px, py));
      }
      piece.fillPoints(hexPoints, true);
    } else {
      // Circular piece for grid board
      piece.fillCircle(0, 0, cellSize * 0.4);
    }
    
    cell.add(piece);
    
    // Add animation effect
    this.scene.tweens.add({
      targets: piece,
      scaleX: { from: 0.5, to: 1 },
      scaleY: { from: 0.5, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  }
  
  /**
   * Switch to the next player
   */
  switchPlayer() {
    // In a two-player game, toggle between 1 and 2
    this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    
    // Emit player change event
    this.scene.events.emit('playerChanged', this.state.currentPlayer);
  }
  
  /**
   * Highlight or unhighlight a cell
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {boolean} highlight - Whether to highlight or unhighlight
   */
  highlightCell(row, col, highlight) {
    const cell = this.cellSprites[row][col];
    const background = cell.cellBackground;
    
    // Update cell state
    this.state.cells[row][col].highlighted = highlight;
    
    // Clear existing graphics
    background.clear();
    
    // Draw with appropriate color
    const color = highlight ? this.config.highlightColor : this.config.cellColor;
    background.fillStyle(color, 1);
    
    if (this.config.style === 'hex') {
      // Redraw hexagon
      const cellSize = this.config.cellSize;
      const hexPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = Phaser.Math.PI2 / 6 * i + Math.PI / 6;
        const px = Math.cos(angle) * cellSize;
        const py = Math.sin(angle) * cellSize;
        hexPoints.push(new Phaser.Math.Vector2(px, py));
      }
      background.fillPoints(hexPoints, true);
    } else {
      // Redraw rounded rectangle
      const cellSize = this.config.cellSize;
      background.fillRoundedRect(
        -cellSize / 2, 
        -cellSize / 2, 
        cellSize, 
        cellSize, 
        5
      );
    }
  }
  
  /**
   * Check if the game has ended
   * This is a basic implementation that should be overridden by specific games
   */
  checkGameEnd() {
    // This is a placeholder to be implemented by specific games
    // For example, checking for a win in Tic-Tac-Toe or Nim
    
    // By default, game ends when all cells are filled
    let allFilled = true;
    
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.columns; col++) {
        if (this.state.cells[row][col].value === 0) {
          allFilled = false;
          break;
        }
      }
      if (!allFilled) break;
    }
    
    if (allFilled) {
      this.endGame(0); // Draw
    }
  }
  
  /**
   * End the game
   * @param {number} winner - The winning player (0 for draw)
   */
  endGame(winner) {
    this.state.gameOver = true;
    this.state.winner = winner;
    
    // Emit game end event
    this.scene.events.emit('gameOver', {
      winner,
      moves: this.state.moves
    });
  }
  
  /**
   * Reset the board
   */
  resetBoard() {
    // Reset state
    this.state.currentPlayer = 1;
    this.state.selectedCell = null;
    this.state.moves = [];
    this.state.gameOver = false;
    this.state.winner = null;
    
    // Reset cell data
    this.initializeCellData();
    
    // Reset visuals
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.columns; col++) {
        const cell = this.cellSprites[row][col];
        
        // Remove piece
        const piece = cell.getByName('piece');
        if (piece) piece.destroy();
        
        // Reset highlight
        this.highlightCell(row, col, false);
      }
    }
    
    // Emit reset event
    this.scene.events.emit('boardReset');
  }
  
  /**
   * Set a cell as selectable or not
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {boolean} selectable - Whether the cell is selectable
   */
  setCellSelectable(row, col, selectable) {
    this.state.cells[row][col].selectable = selectable;
    
    // Visually indicate selectable status if needed
    const cell = this.cellSprites[row][col];
    cell.alpha = selectable ? 1 : 0.5;
  }
  
  /**
   * Get the current board state
   * @returns {Object} The current board state
   */
  getBoardState() {
    return { ...this.state };
  }
  
  /**
   * Set the board state
   * @param {Object} state - The new board state
   */
  setBoardState(state) {
    // Update state
    this.state = { ...this.state, ...state };
    
    // Update visuals
    this.updateBoardVisuals();
  }
  
  /**
   * Update board visuals based on current state
   */
  updateBoardVisuals() {
    // Clear and redraw all cells
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.columns; col++) {
        const cell = this.cellSprites[row][col];
        const cellData = this.state.cells[row][col];
        
        // Remove existing piece
        const piece = cell.getByName('piece');
        if (piece) piece.destroy();
        
        // Add piece if cell has a value
        if (cellData.value > 0) {
          this.visualizeMove(row, col);
        }
        
        // Update highlighting
        this.highlightCell(row, col, cellData.highlighted);
        
        // Update selectability
        cell.alpha = cellData.selectable ? 1 : 0.5;
      }
    }
  }
  
  /**
   * Show debug information
   */
  showDebugInfo() {
    const debugText = this.scene.add.text(
      0,
      this.boardHeight / 2 + 20,
      'Debug Mode',
      {
        fontFamily: 'Arial',
        fontSize: 14,
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    this.boardContainer.add(debugText);
  }
  
  /**
   * Resize the board
   * @param {number} width - New game width
   * @param {number} height - New game height
   */
  resize(width, height) {
    // Calculate new cell size based on available space
    const maxCellWidth = (width * 0.8) / this.config.columns;
    const maxCellHeight = (height * 0.8) / this.config.rows;
    const newCellSize = Math.min(maxCellWidth, maxCellHeight, this.config.cellSize);
    
    // Update config
    this.config.cellSize = newCellSize;
    
    // Redraw the board
    this.rebuildBoard();
  }
  
  /**
   * Rebuild the board (call after changing config)
   */
  rebuildBoard() {
    // Remove all children
    this.boardContainer.removeAll(true);
    
    // Reinitialize
    this.initializeBoard();
    
    // Restore state
    this.updateBoardVisuals();
  }
  
  /**
   * Destroy the board and clean up
   */
  destroy() {
    // Clean up Phaser objects
    this.boardContainer.destroy();
  }
}