# Game Engine Module

This directory contains the Phaser game engine integration with our Svelte frontend for Ocean of Puzzles.

## Directory Structure

- `PhaserContainer.svelte` - Core component that wraps the Phaser game instance
- `GameCanvas.svelte` - UI component with loading states and error handling
- `GameManager.js` - Scene manager and game state controller
- `GameStateManager.js` - Handles game state persistence using localStorage
- `scenes/` - Directory containing game scenes
  - `BaseScene.js` - Base class with common functionality for all scenes
  - `TestScene.js` - Interactive demo scene with ocean theme
  - `NimGame.js` - Nim game implementation
- `board/` - Directory containing board game implementations
  - `BoardEngine.js` - Generic framework for board-based games
  - `NimBoard.js` - Nim-specific board implementation
- `assets/` - Asset loading and management
  - `AssetLoader.js` - Asset loading and caching system
  - `AssetManifest.js` - Central definition of game assets

## Usage Guide

To use the game engine in a Svelte component:

```svelte
<script>
  import GameCanvas from '../game/GameCanvas.svelte';
  import gameManager from '../game/GameManager.js';
  
  // For using a specific game
  function startNimGame() {
    if (gameManager) {
      gameManager.startNimGame({
        aiOpponent: true,
        playerNames: ['You', 'Computer']
      });
    }
  }
</script>

<GameCanvas 
  width="100%" 
  height="600px" 
  startScene="TestScene" 
/>

<button on:click={startNimGame}>Play Nim</button>
```

## Architecture

1. `PhaserContainer.svelte` initializes the Phaser instance with proper lifecycle management
2. `GameCanvas.svelte` provides a responsive canvas with loading/error states
3. `GameManager.js` provides a singleton to manage scenes and game state
4. `GameStateManager.js` handles persistence of game progress
5. `BaseScene.js` defines common game behavior inherited by all game scenes
6. `BoardEngine.js` provides a reusable framework for board games
7. `AssetLoader.js` handles loading and caching game assets
8. Specific game scenes implement actual gameplay logic

## Game Flow

1. The user navigates to a game page (e.g., GameDemo.svelte)
2. The page renders a GameCanvas component
3. GameCanvas initializes a PhaserContainer
4. When PhaserContainer is ready, GameCanvas initializes the GameManager
5. GameManager loads and starts the requested scene
6. The scene handles user input and game logic
7. Game state is persisted using GameStateManager

## Adding a New Game

To add a new game:

1. Create a new board implementation in `board/` (e.g., `MyGameBoard.js`)
2. Create a new scene in `scenes/` (e.g., `MyGame.js`)
3. Register the scene in `GameManager.js`
4. Add game-specific assets to `AssetManifest.js`
5. Implement game logic, UI, and AI in the scene and board classes
6. Add a method to start the game in GameManager
7. Update the game selection UI to include the new game

## Integration Points

- **User Interface**: `GameCanvas.svelte` provides loading states and error handling
- **State Management**: `GameManager.js` exposes a Svelte store for reactive state updates
- **Navigation**: Game scenes can trigger navigation via the Svelte router when needed
- **Persistence**: `GameStateManager.js` provides local storage for game progress
- **AI Opponents**: Game implementations can include AI logic for solo play

## Responsive Design

The game adapts to different screen sizes and orientations:
- Canvas size adjusts based on container size
- Game UI repositions elements for different screen sizes
- Touch and mouse input are both supported
- Portrait/landscape detection with appropriate layouts

## Related Documentation

For implementation status and roadmap information, see the main [Implementation Status](../../../IMPLEMENTATION_STATUS.md) document.