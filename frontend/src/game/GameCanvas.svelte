<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import PhaserContainer from './PhaserContainer.svelte';
  import gameManager from './GameManager';
  import { toastStore } from '../stores/user-store';
  
  // Props
  export let width = "100%";
  export let height = "600px";
  export let startScene = "TestScene"; // Default scene to start
  export let gameData = {}; // Data to pass to the scene
  
  // Component state
  let phaserContainer;
  let phaserInstance = null;
  let gameState = { initialized: false, loading: true, error: null };
  let gameInitialized = false;
  
  // Subscribe to game state updates
  const unsubscribe = gameManager.state.subscribe(state => {
    gameState = state;
  });
  
  // Initialize the game when the container is mounted
  onMount(() => {
    return () => {
      unsubscribe();
    };
  });
  
  // Function to initialize the game after the container is ready
  function initGame() {
    if (!phaserContainer || gameInitialized) return;
    
    // Get Phaser instance from container
    phaserInstance = phaserContainer.getGame();
    
    if (phaserInstance) {
      // Initialize game manager with Phaser instance
      const success = gameManager.init(phaserInstance);
      
      if (success) {
        gameInitialized = true;
        
        // Start the requested scene
        gameManager.startScene(startScene, gameData);
      } else {
        toastStore.show('Failed to initialize game', 'error');
      }
    }
  }
  
  // React to changes in the startScene prop
  $: if (gameInitialized && startScene) {
    gameManager.startScene(startScene, gameData);
  }
  
  // React to changes in the gameData prop
  $: if (gameInitialized && gameData) {
    // Only restart if game is already running with the same scene
    const currentState = {};
    gameManager.state.subscribe(s => Object.assign(currentState, s))();
    
    if (currentState.currentScene === startScene) {
      gameManager.startScene(startScene, gameData);
    }
  }
  
  // Handle container binding
  function handleContainerBinding(container) {
    phaserContainer = container;
    
    // Try to initialize game after a short delay to ensure container is ready
    setTimeout(() => {
      initGame();
    }, 100);
  }
  
  // Clean up on destroy
  onDestroy(() => {
    unsubscribe();
    
    if (gameInitialized) {
      gameManager.destroy();
      gameInitialized = false;
    }
  });
</script>

<div class="game-canvas-wrapper" style="width: {width}; height: {height};">
  <PhaserContainer 
    bind:this={phaserContainer}
    width={width}
    height={height}
    gameConfig={{}}
    on:ready={initGame}
  />
  
  {#if gameState.loading}
    <div class="game-overlay" transition:fade={{ duration: 300 }}>
      <div class="loading-spinner">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
      <p>Loading...</p>
    </div>
  {/if}
  
  {#if gameState.error}
    <div class="game-overlay error" transition:fade={{ duration: 300 }}>
      <div class="error-icon">⚠️</div>
      <p>{gameState.error}</p>
      <button class="retry-button" on:click={() => gameManager.startTestScene()}>
        Retry
      </button>
    </div>
  {/if}
</div>

<style lang="scss">
  .game-canvas-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    background-color: #103554;
  }
  
  .game-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgba(16, 53, 84, 0.8);
    z-index: 10;
    color: white;
    
    &.error {
      background-color: rgba(220, 53, 69, 0.8);
    }
    
    p {
      margin: 1rem 0;
      font-size: 1.2rem;
      max-width: 80%;
      text-align: center;
    }
    
    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .retry-button {
      padding: 0.5rem 1.5rem;
      background-color: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 1rem;
      
      &:hover {
        background-color: #1976d2;
      }
    }
  }
  
  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 50px;
    width: 100px;
    margin-bottom: 1rem;
    
    .wave {
      width: 8px;
      height: 40px;
      margin: 0 3px;
      background-color: #2196f3;
      border-radius: 10px;
      animation: wave 1s ease-in-out infinite;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
  
  @keyframes wave {
    0% {
      height: 10px;
    }
    50% {
      height: 40px;
    }
    100% {
      height: 10px;
    }
  }
</style>