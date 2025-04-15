<script>
  import GameCanvas from '../game/GameCanvas.svelte';
  import { toastStore } from '../stores/user-store';
  import { onMount } from 'svelte';
  
  let gameHeight = "600px";
  let isPortrait = false;
  let currentGame = "demo"; // 'demo', 'nim', etc.
  let gameCanvas;
  let gameManager;
  
  // Check orientation on mount and set appropriate dimensions
  onMount(() => {
    checkOrientation();
    
    // Add resize listener
    window.addEventListener('resize', checkOrientation);
    
    // Import game manager
    import('../game/GameManager.js').then(module => {
      gameManager = module.default;
    });
    
    // Show welcome toast
    toastStore.show('Welcome to the Ocean of Puzzles demo!', 'info');
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  });
  
  // Update dimensions based on screen orientation
  function checkOrientation() {
    isPortrait = window.innerHeight > window.innerWidth;
    
    // Adjust game height based on orientation
    if (isPortrait) {
      gameHeight = "400px";
    } else {
      gameHeight = "600px";
    }
  }
  
  // Restart current game
  function restartGame() {
    if (!gameManager) return;
    
    switch (currentGame) {
      case 'nim':
        gameManager.startNimGame({
          aiOpponent: true,
          aiDifficulty: 'medium'
        });
        break;
      case 'demo':
      default:
        gameManager.startTestScene();
        break;
    }
    
    toastStore.show('Game restarted', 'success');
  }
  
  // Start the Nim game
  function startNimGame() {
    if (!gameManager) return;
    
    // Update current game
    currentGame = 'nim';
    
    // Start nim game with AI opponent
    gameManager.startNimGame({
      aiOpponent: true,
      aiDifficulty: 'medium',
      playerNames: ['You', 'Computer']
    });
    
    toastStore.show('Starting Nim game against AI', 'info');
  }
  
  // Start the physics demo
  function startPhysicsDemo() {
    if (!gameManager) return;
    
    // Update current game
    currentGame = 'demo';
    
    // Start test scene
    gameManager.startTestScene();
    
    toastStore.show('Starting physics demo', 'info');
  }
  
  // Get the appropriate start scene based on current game
  function getStartScene() {
    switch (currentGame) {
      case 'nim':
        return 'NimGame';
      case 'demo':
      default:
        return 'TestScene';
    }
  }
</script>

<div class="game-demo-page">
  <div class="container">
    <header class="page-header">
      <h1>Ocean of Puzzles</h1>
      <p class="subtitle">Interactive Game Demo</p>
    </header>
    
    <div class="game-selection">
      <button 
        class="game-button {currentGame === 'demo' ? 'active' : ''}" 
        on:click={startPhysicsDemo}
      >
        <span class="game-icon">🌊</span>
        <span class="game-label">Physics Demo</span>
      </button>
      
      <button 
        class="game-button {currentGame === 'nim' ? 'active' : ''}" 
        on:click={startNimGame}
      >
        <span class="game-icon">🪨</span>
        <span class="game-label">Nim Game</span>
      </button>
    </div>
    
    <div class="game-section">
      <GameCanvas
        width="100%"
        height={gameHeight}
        startScene={getStartScene()}
        bind:this={gameCanvas}
      />
      
      <div class="game-controls">
        <button class="control-button refresh" on:click={restartGame}>
          <span class="icon">🔄</span>
          <span class="text">Restart Game</span>
        </button>
      </div>
    </div>
    
    {#if currentGame === 'demo'}
      <div class="instructions-card">
        <h2>Physics Demo Instructions</h2>
        <div class="instruction-content">
          <p>
            This is a simple demo of the Phaser game engine integration. 
            Click the "Create Bubbles" button to generate animated bubbles.
            You can also click anywhere on the game canvas to create water ripple effects.
          </p>
          
          <div class="instruction-list">
            <div class="instruction-item">
              <span class="instruction-icon">👆</span>
              <span class="instruction-text">Click on the game canvas to create water ripples</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-icon">🫧</span>
              <span class="instruction-text">Click the "Create Bubbles" button to generate bubbles</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-icon">🔄</span>
              <span class="instruction-text">Use the "Restart Game" button to reset the demo</span>
            </div>
          </div>
        </div>
      </div>
    {:else if currentGame === 'nim'}
      <div class="instructions-card">
        <h2>Nim Game Instructions</h2>
        <div class="instruction-content">
          <p>
            Nim is a mathematical game of strategy. Players take turns removing objects from rows.
            On each turn, a player must remove at least one object, and may remove any number of objects
            as long as they all come from the same row. The player who takes the last object loses.
          </p>
          
          <div class="instruction-list">
            <div class="instruction-item">
              <span class="instruction-icon">👆</span>
              <span class="instruction-text">Click on an object to remove it and all objects to its right</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-icon">💡</span>
              <span class="instruction-text">Use the "Hint" button if you're stuck</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-icon">🔄</span>
              <span class="instruction-text">Click "Reset Game" to start a new game</span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .game-demo-page {
    padding: 1rem;
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      text-align: center;
      margin-bottom: 1.5rem;
      
      h1 {
        color: var(--ocean-primary);
        margin-bottom: 0.5rem;
      }
      
      .subtitle {
        color: var(--ocean-secondary);
        font-size: 1.2rem;
        margin: 0;
      }
    }
    
    .game-selection {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      
      .game-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background-color: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        width: 140px;
        
        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        &.active {
          border-color: var(--ocean-primary);
          background-color: rgba(33, 150, 243, 0.05);
        }
        
        .game-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .game-label {
          font-weight: 500;
        }
      }
    }
    
    .game-section {
      margin-bottom: 2rem;
      border-radius: 8px;
      overflow: hidden;
      background-color: #103554;
    }
    
    .game-controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
      padding: 1rem;
      background-color: white;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .control-button {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      
      &.refresh {
        background-color: var(--ocean-primary);
        color: white;
        
        &:hover {
          background-color: var(--ocean-secondary);
        }
      }
      
      .icon {
        margin-right: 0.5rem;
        font-size: 1.2rem;
      }
    }
    
    .instructions-card {
      background-color: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
      
      h2 {
        color: var(--ocean-primary);
        margin-top: 0;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--ocean-accent-light);
      }
      
      p {
        margin-top: 0;
        line-height: 1.6;
        color: var(--ocean-text);
      }
      
      .instruction-list {
        margin-top: 1.5rem;
      }
      
      .instruction-item {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
        
        .instruction-icon {
          font-size: 1.5rem;
          margin-right: 1rem;
          min-width: 30px;
          text-align: center;
        }
        
        .instruction-text {
          flex: 1;
        }
      }
    }
    
    @media (max-width: 768px) {
      .page-header {
        margin-bottom: 1rem;
        
        h1 {
          font-size: 1.8rem;
        }
        
        .subtitle {
          font-size: 1rem;
        }
      }
      
      .instructions-card {
        padding: 1rem;
      }
      
      .control-button {
        padding: 0.5rem 1rem;
        
        .text {
          display: none;
        }
        
        .icon {
          margin-right: 0;
          font-size: 1.5rem;
        }
      }
      
      .game-selection {
        .game-button {
          width: 120px;
          padding: 0.75rem;
          
          .game-icon {
            font-size: 1.5rem;
          }
          
          .game-label {
            font-size: 0.9rem;
          }
        }
      }
    }
  }
</style>