<script>
  import { onMount, onDestroy } from 'svelte';
  import Phaser from 'phaser';
  
  // Props
  export let gameConfig = {}; // Custom game configuration object
  export let width = "100%";  // Default width of the container
  export let height = "600px"; // Default height of the container
  
  // Internal state
  let gameContainer;
  let game = null;
  
  // Default game configuration
  const defaultConfig = {
    type: Phaser.AUTO,
    parent: undefined, // Will be set during initialization
    width: 800,
    height: 600,
    backgroundColor: '#1a4562', // Ocean-themed background
    disableContextMenu: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    }
  };
  
  // Initialize game once component is mounted
  onMount(() => {
    if (!gameContainer) return;
    
    // Merge default config with any user-provided config
    const config = {
      ...defaultConfig,
      ...gameConfig,
      parent: gameContainer // Always use our container as the parent
    };
    
    // Create the Phaser game instance
    game = new Phaser.Game(config);
    
    // Setup responsive handling
    const resizeGame = () => {
      if (!game) return;
      
      const container = gameContainer.getBoundingClientRect();
      if (!container.width || !container.height) return;
      
      // Only update if needed
      if (game.scale.width !== container.width || 
          game.scale.height !== container.height) {
        game.scale.resize(container.width, container.height);
      }
    };
    
    // Initial resize
    resizeGame();
    
    // Add resize event listener
    window.addEventListener('resize', resizeGame);
    
    // Clean up function to be called during onDestroy
    return () => {
      window.removeEventListener('resize', resizeGame);
    };
  });
  
  // Clean up Phaser instance when component is destroyed
  onDestroy(() => {
    if (game) {
      game.destroy(true);
      game = null;
    }
  });
  
  // Expose the game instance through a custom store
  // or context to allow scenes to be added from parent components
  export function getGame() {
    return game;
  }
</script>

<div class="phaser-container" 
     bind:this={gameContainer} 
     style="width: {width}; height: {height};">
</div>

<style>
  .phaser-container {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: #1a4562; /* Ocean blue background */
  }
</style>