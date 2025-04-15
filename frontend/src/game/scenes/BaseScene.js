import Phaser from 'phaser';

/**
 * Base scene class that all game scenes will extend
 * Provides common functionality for game scenes
 */
export default class BaseScene extends Phaser.Scene {
  /**
   * @param {string} key - Unique identifier for this scene
   * @param {Object} options - Configuration options for the scene
   */
  constructor(key, options = {}) {
    super(key);
    this.options = options;
    this.sceneKey = key;
  }

  /**
   * Initialize scene with data passed from another scene
   * @param {Object} data - Data passed from another scene
   */
  init(data) {
    this.gameData = data || {};
    this.width = this.game.config.width;
    this.height = this.game.config.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  /**
   * Preload assets needed for this scene
   */
  preload() {
    // Add loading indicator if needed
    this.addLoadingIndicator();
  }

  /**
   * Add a loading indicator to display while assets are loading
   */
  addLoadingIndicator() {
    if (this.loadingText) return;
    
    // Only add loading text if we're actively loading assets
    if (this.load && this.load.isLoading()) {
      this.loadingText = this.add.text(
        this.centerX, 
        this.centerY, 
        'Loading...', 
        { 
          font: '24px Arial', 
          fill: '#ffffff' 
        }
      ).setOrigin(0.5);
      
      // Show loading progress
      this.load.on('progress', (value) => {
        if (this.loadingText) {
          this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
        }
      });
      
      // Remove loading text when complete
      this.load.on('complete', () => {
        if (this.loadingText) {
          this.loadingText.destroy();
          this.loadingText = null;
        }
      });
    }
  }

  /**
   * Create game objects for this scene
   */
  create() {
    // Set up responsive handling
    this.setupResizeListener();

    // Add background
    this.createBackground();
  }

  /**
   * Set up resize listener for responsive layout
   */
  setupResizeListener() {
    this.scale.on('resize', this.onResize, this);
  }

  /**
   * Handle resize events
   * @param {Object} gameSize - New game size
   */
  onResize(gameSize) {
    this.width = gameSize.width;
    this.height = gameSize.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    
    // Update game objects positions if needed
    this.updateLayout();
  }

  /**
   * Update the layout based on current screen size
   * Should be implemented by child classes
   */
  updateLayout() {
    // To be implemented by child classes
  }

  /**
   * Create background for the scene
   */
  createBackground() {
    // Create a gradient background by default
    // Can be overridden by child classes
    const backgroundColor = this.options.backgroundColor || 0x1a4562;
    
    this.bg = this.add.graphics();
    this.bg.fillGradientStyle(
      backgroundColor, // Top color (ocean deep)
      backgroundColor, // Top-right color
      0x2196f3,        // Bottom-right color (ocean light)
      0x2196f3,        // Bottom-left color
      1
    );
    this.bg.fillRect(0, 0, this.width, this.height);
    
    // Ensure background is the bottommost layer
    this.bg.setDepth(-1);
  }

  /**
   * Create a button with text
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} text - Button text
   * @param {Function} callback - Function to call when button is clicked
   * @param {Object} style - Style configuration for the button
   * @returns {Phaser.GameObjects.Container} The button container
   */
  createButton(x, y, text, callback, style = {}) {
    // Default style values
    const defaultStyle = {
      width: 200,
      height: 50,
      backgroundColor: 0x2196f3,
      backgroundColorHover: 0x1976d2,
      textColor: 0xffffff,
      fontSize: 16,
      fontFamily: 'Arial',
      borderRadius: 8,
      padding: 10
    };
    
    const finalStyle = { ...defaultStyle, ...style };
    
    // Create container for the button
    const container = this.add.container(x, y);
    
    // Create button background
    const bg = this.add.graphics();
    bg.fillStyle(finalStyle.backgroundColor, 1);
    
    // Draw rounded rectangle
    bg.fillRoundedRect(
      -finalStyle.width / 2, 
      -finalStyle.height / 2, 
      finalStyle.width, 
      finalStyle.height, 
      finalStyle.borderRadius
    );
    
    // Create button text
    const buttonText = this.add.text(
      0, 
      0, 
      text, 
      {
        fontSize: finalStyle.fontSize,
        fontFamily: finalStyle.fontFamily,
        fill: `#${finalStyle.textColor.toString(16).padStart(6, '0')}`
      }
    ).setOrigin(0.5);
    
    // Add to container
    container.add(bg);
    container.add(buttonText);
    
    // Make interactive
    container.setSize(finalStyle.width, finalStyle.height);
    container.setInteractive({ useHandCursor: true });
    
    // Add hover and click effects
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(finalStyle.backgroundColorHover, 1);
      bg.fillRoundedRect(
        -finalStyle.width / 2, 
        -finalStyle.height / 2, 
        finalStyle.width, 
        finalStyle.height, 
        finalStyle.borderRadius
      );
    });
    
    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(finalStyle.backgroundColor, 1);
      bg.fillRoundedRect(
        -finalStyle.width / 2, 
        -finalStyle.height / 2, 
        finalStyle.width, 
        finalStyle.height, 
        finalStyle.borderRadius
      );
    });
    
    container.on('pointerdown', () => {
      if (callback) {
        callback();
      }
    });
    
    return container;
  }

  /**
   * Transition to another scene with a fade effect
   * @param {string} targetScene - Key of the scene to transition to
   * @param {Object} data - Data to pass to the target scene
   * @param {number} duration - Duration of the fade effect in milliseconds
   */
  transitionToScene(targetScene, data = {}, duration = 500) {
    this.cameras.main.fadeOut(duration);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(targetScene, data);
    });
  }
}