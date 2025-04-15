import BoardEngine from './BoardEngine';

/**
 * NimBoard class
 * Implements the specific rules and visuals for the Nim game
 */
export default class NimBoard extends BoardEngine {
  /**
   * Create a new Nim board
   * @param {Phaser.Scene} scene - The Phaser scene this board is attached to
   * @param {Object} config - Configuration options for the board
   */
  constructor(scene, config = {}) {
    // Nim-specific default configuration
    const nimConfig = {
      rows: 4,         // Number of rows (heaps)
      columns: 7,      // Max number of objects per row
      nimHeaps: [3, 5, 7, 9], // Number of objects in each heap
      style: 'nim',    // Special style for Nim
      showRowLabels: true,
      objectScale: 0.8
    };
    
    // Merge with provided config
    const mergedConfig = { ...nimConfig, ...config };
    
    // Call parent constructor with merged config
    super(scene, mergedConfig);
    
    // Nim-specific state
    this.state.activeRow = null;
    this.state.heaps = [...this.config.nimHeaps];
    this.state.maxHeapSize = Math.max(...this.config.nimHeaps);
    
    // Initialize Nim-specific elements
    this.initializeNimBoard();
  }
  
  /**
   * Override createBoardBackground for Nim-specific layout
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
    
    // Add row labels if enabled
    if (this.config.showRowLabels) {
      this.addRowLabels();
    }
  }
  
  /**
   * Add labels for each row (heap)
   */
  addRowLabels() {
    const startY = -(this.boardHeight / 2) + (this.config.cellSize / 2) + this.config.cellPadding;
    const labelX = -(this.boardWidth / 2) - 30;
    
    for (let row = 0; row < this.config.rows; row++) {
      const y = startY + (row * (this.config.cellSize + this.config.cellPadding));
      
      const label = this.scene.add.text(
        labelX,
        y,
        `Row ${row + 1}:`,
        {
          fontFamily: 'Arial',
          fontSize: 16,
          color: '#ffffff'
        }
      ).setOrigin(1, 0.5);
      
      this.boardContainer.add(label);
    }
  }
  
  /**
   * Initialize Nim-specific board elements
   */
  initializeNimBoard() {
    // Override cell data initialization for Nim
    this.initializeNimCells();
    
    // Create Nim objects
    this.createNimObjects();
  }
  
  /**
   * Initialize cell data structure for Nim
   */
  initializeNimCells() {
    // In Nim, we track which objects are taken
    this.state.cells = [];
    
    for (let row = 0; row < this.config.rows; row++) {
      this.state.cells[row] = [];
      const heapSize = this.state.heaps[row];
      
      for (let col = 0; col < this.config.columns; col++) {
        this.state.cells[row][col] = {
          value: col < heapSize ? 1 : 0, // 1 = object present, 0 = empty or taken
          highlighted: false,
          selectable: col < heapSize // Only existing objects are selectable
        };
      }
    }
  }
  
  /**
   * Create visual representations of Nim objects
   */
  createNimObjects() {
    const cellSize = this.config.cellSize;
    const padding = this.config.cellPadding;
    const startX = -(this.boardWidth / 2) + padding + (cellSize / 2);
    const startY = -(this.boardHeight / 2) + padding + (cellSize / 2);
    
    // Create object sprites
    this.objectSprites = [];
    
    for (let row = 0; row < this.config.rows; row++) {
      this.objectSprites[row] = [];
      const heapSize = this.state.heaps[row];
      
      for (let col = 0; col < heapSize; col++) {
        // Calculate position
        const x = startX + (col * (cellSize + padding));
        const y = startY + (row * (cellSize + padding));
        
        // Create object
        const object = this.createNimObject(x, y, row, col);
        this.objectSprites[row][col] = object;
      }
    }
  }
  
  /**
   * Create a Nim object (stone/stick/etc.)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {Phaser.GameObjects.Container} The object container
   */
  createNimObject(x, y, row, col) {
    // Create container
    const container = this.scene.add.container(x, y);
    this.boardContainer.add(container);
    
    // Create object graphic
    const objectGraphic = this.scene.add.graphics();
    const objectColor = 0x4a9be8; // Blue
    const objectSize = this.config.cellSize * this.config.objectScale;
    
    // Draw different shapes based on row
    switch (row % 3) {
      case 0:
        // Circle
        objectGraphic.fillStyle(objectColor, 1);
        objectGraphic.fillCircle(0, 0, objectSize / 2);
        break;
      case 1:
        // Square
        objectGraphic.fillStyle(objectColor, 1);
        objectGraphic.fillRoundedRect(
          -objectSize / 2,
          -objectSize / 2,
          objectSize,
          objectSize,
          8
        );
        break;
      case 2:
        // Triangle
        objectGraphic.fillStyle(objectColor, 1);
        objectGraphic.fillTriangle(
          0, -objectSize / 2,
          -objectSize / 2, objectSize / 2,
          objectSize / 2, objectSize / 2
        );
        break;
    }
    
    container.add(objectGraphic);
    
    // Store references
    container.objectGraphic = objectGraphic;
    container.row = row;
    container.col = col;
    
    // Make interactive
    container.setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.onObjectOver(row, col))
      .on('pointerout', () => this.onObjectOut(row, col))
      .on('pointerdown', () => this.onObjectClick(row, col));
    
    return container;
  }
  
  /**
   * Handle object hover
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  onObjectOver(row, col) {
    // Only highlight if object is selectable and in active row (or no active row selected)
    if (this.isObjectSelectable(row, col)) {
      this.highlightObject(row, col, true);
      
      // In Nim, we highlight all objects to the right
      if (this.state.activeRow === row || this.state.activeRow === null) {
        for (let c = col + 1; c < this.state.heaps[row]; c++) {
          this.highlightObject(row, c, true);
        }
      }
    }
  }
  
  /**
   * Handle object hover end
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  onObjectOut(row, col) {
    // Remove highlight
    this.highlightObject(row, col, false);
    
    // Remove highlight from all objects to the right
    for (let c = col + 1; c < this.state.heaps[row]; c++) {
      this.highlightObject(row, c, false);
    }
  }
  
  /**
   * Check if an object is selectable
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {boolean} True if the object is selectable
   */
  isObjectSelectable(row, col) {
    // In Nim, objects are selectable if:
    // 1. The game is not over
    // 2. The object exists (value = 1)
    // 3. Either no row is active, or this is the active row
    return (
      !this.state.gameOver &&
      this.state.cells[row][col].value === 1 &&
      (this.state.activeRow === null || this.state.activeRow === row)
    );
  }
  
  /**
   * Highlight or unhighlight an object
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {boolean} highlight - Whether to highlight or unhighlight
   */
  highlightObject(row, col, highlight) {
    if (col >= this.state.heaps[row]) return;
    
    const object = this.objectSprites[row][col];
    if (!object) return;
    
    // Scale effect for highlighting
    const scale = highlight ? 1.2 : 1.0;
    this.scene.tweens.add({
      targets: object,
      scaleX: scale,
      scaleY: scale,
      duration: 100,
      ease: 'Power1',
      yoyo: false
    });
    
    // Update object state
    this.state.cells[row][col].highlighted = highlight;
  }
  
  /**
   * Handle object click
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  onObjectClick(row, col) {
    // Check if the move is valid
    if (this.isObjectSelectable(row, col)) {
      // Set active row if none is selected
      if (this.state.activeRow === null) {
        this.state.activeRow = row;
      }
      
      // Make the move
      this.makeNimMove(row, col);
    }
  }
  
  /**
   * Make a Nim move
   * @param {number} row - Row index
   * @param {number} col - Column index
   */
  makeNimMove(row, col) {
    // In Nim, a move means removing the clicked object and all objects to its right
    const objectsToRemove = [];
    
    // Collect objects to remove
    for (let c = col; c < this.state.heaps[row]; c++) {
      objectsToRemove.push({ row, col: c });
      this.state.cells[row][c].value = 0;
      this.state.cells[row][c].selectable = false;
    }
    
    // Update heap size
    const removed = this.state.heaps[row] - col;
    this.state.heaps[row] = col;
    
    // Animate removal
    this.animateObjectsRemoval(objectsToRemove);
    
    // Add to move history
    this.state.moves.push({
      row,
      startCol: col,
      endCol: this.state.heaps[row] - 1,
      count: removed,
      player: this.state.currentPlayer
    });
    
    // Check for game end
    this.checkGameEnd();
    
    // Reset active row and switch player if game is not over
    if (!this.state.gameOver) {
      this.state.activeRow = null;
      this.switchPlayer();
    }
  }
  
  /**
   * Animate the removal of objects
   * @param {Array} objects - Array of {row, col} objects to remove
   */
  animateObjectsRemoval(objects) {
    for (const obj of objects) {
      const sprite = this.objectSprites[obj.row][obj.col];
      if (!sprite) continue;
      
      // Fade out and scale down animation
      this.scene.tweens.add({
        targets: sprite,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          sprite.visible = false;
        }
      });
    }
  }
  
  /**
   * Check if the game has ended
   * In Nim, the game ends when all objects are removed
   */
  checkGameEnd() {
    let totalRemaining = 0;
    
    // Count remaining objects
    for (let row = 0; row < this.config.rows; row++) {
      totalRemaining += this.state.heaps[row];
    }
    
    // If no objects remain, game is over
    if (totalRemaining === 0) {
      // In misère Nim (standard rules), the player who takes the last object loses
      const winner = this.state.currentPlayer === 1 ? 2 : 1;
      this.endGame(winner);
    }
  }
  
  /**
   * Reset the Nim board
   */
  resetBoard() {
    // Reset Nim-specific state
    this.state.activeRow = null;
    this.state.heaps = [...this.config.nimHeaps];
    
    // Reset basic state
    this.state.currentPlayer = 1;
    this.state.moves = [];
    this.state.gameOver = false;
    this.state.winner = null;
    
    // Clear the board
    this.boardContainer.removeAll(true);
    
    // Rebuild the board
    this.createBoardBackground();
    this.initializeNimCells();
    this.createNimObjects();
    
    // Emit reset event
    this.scene.events.emit('boardReset');
  }
  
  /**
   * Create a hint for the current player
   */
  createHint() {
    // Nim strategy hint
    let nimSum = 0;
    for (let row = 0; row < this.config.rows; row++) {
      nimSum ^= this.state.heaps[row]; // Bitwise XOR
    }
    
    // If nim-sum is 0, you're in a losing position
    if (nimSum === 0) {
      return {
        type: 'best-guess',
        message: 'You are in a losing position. Take any move and hope your opponent makes a mistake.',
        moves: [{ row: 0, count: 1 }] // Just suggest removing one object from first row
      };
    }
    
    // Calculate winning move
    for (let row = 0; row < this.config.rows; row++) {
      const heap = this.state.heaps[row];
      const target = heap ^ nimSum; // XOR with nim-sum gives target heap size
      
      if (target < heap) {
        // Found a winning move
        return {
          type: 'winning',
          message: `Remove ${heap - target} objects from row ${row + 1}`,
          moves: [{ row, count: heap - target }]
        };
      }
    }
    
    // Fallback
    return {
      type: 'fallback',
      message: 'No optimal move found. Try removing one object.',
      moves: [{ row: 0, count: 1 }]
    };
  }
}