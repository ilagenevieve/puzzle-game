# Code Style Guide

This document outlines the coding standards and style guidelines for the Ocean of Puzzles project.

## General Guidelines

- Use 2-space indentation
- Use single quotes for strings
- Avoid semicolons (except where required)
- Maximum line length of 100 characters
- Use meaningful variable and function names
- Add JSDoc comments to all functions, components, and classes
- Follow the principle of "Clean Code" - code should be readable and self-explanatory

## JavaScript/TypeScript Guidelines

### Naming Conventions

- **Variables and functions**: camelCase
  ```javascript
  const playerScore = 0;
  function calculateTotalScore() { ... }
  ```

- **Classes and components**: PascalCase
  ```javascript
  class GameBoard { ... }
  export default function PlayerCard() { ... }
  ```

- **Constants**: UPPER_SNAKE_CASE (for true constants)
  ```javascript
  const MAX_PLAYERS = 2;
  const DEFAULT_BOARD_SIZE = 8;
  ```

- **Private methods/properties**: Use leading underscore
  ```javascript
  class Game {
    _internalState = {};
    _initializeBoard() { ... }
  }
  ```

### Code Organization

- Group related functions and variables
- Place imports at the top of the file
- Order imports: external libraries first, then internal modules
- Export at the end of the file (or use named exports inline)

### Functions

- Keep functions small and focused on a single task
- Limit function parameters (use objects for multiple parameters)
- Avoid side effects where possible
- Use arrow functions for callbacks and anonymous functions

```javascript
// Good
const calculateScore = (moves, difficulty) => {
  return moves * difficultyMultiplier[difficulty];
};

// Avoid
function doManyThings(data) {
  // Function that does multiple unrelated operations
}
```

### Conditionals

- Use ternary operators for simple conditions
- Use early returns to avoid deep nesting
- Use guard clauses

```javascript
// Good
if (!user) return null;

// Instead of
if (user) {
  // Lots of code
} else {
  return null;
}
```

### Error Handling

- Use try/catch blocks for operations that might fail
- Provide meaningful error messages
- Include error types for distinguishing between errors

```javascript
try {
  await gameService.makeMove(gameId, move);
} catch (error) {
  if (error.type === 'InvalidMoveError') {
    // Handle invalid move
  } else {
    // Handle other errors
  }
}
```

## Svelte Guidelines

### Component Structure

- One component per file
- Component name should match filename
- Follow this order within components:
  1. Script
  2. Template
  3. Style

```svelte
<script>
  // Imports
  import { onMount } from 'svelte';
  
  // Props
  export let title;
  
  // Local state
  let count = 0;
  
  // Lifecycle and derived values
  onMount(() => {
    // Initialization
  });
  
  // Methods
  function increment() {
    count += 1;
  }
</script>

<div class="component">
  <h1>{title}</h1>
  <button on:click={increment}>Count: {count}</button>
</div>

<style>
  .component {
    /* Styles */
  }
</style>
```

### Props

- Use explicit prop definitions
- Provide default values where appropriate
- Validate props where necessary

```svelte
<script>
  export let name = 'Default';
  export let score = 0;
  export let required; // No default, will show warning if missing
  
  // Derived values from props
  $: displayName = name || 'Anonymous';
</script>
```

### Events

- Use event forwarding when needed
- Create custom events with createEventDispatcher
- Name events using kebab-case

```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    dispatch('button-click', {
      detail: 'Additional data'
    });
  }
</script>

<button on:click={handleClick}>Click Me</button>
```

### Reactivity

- Use reactive declarations (`$:`) for derived values
- Avoid complex logic in reactive declarations
- Group related reactive statements

```svelte
<script>
  export let items = [];
  export let filter = '';
  
  $: filteredItems = filter 
    ? items.filter(item => item.name.includes(filter)) 
    : items;
    
  $: itemCount = filteredItems.length;
</script>
```

## CSS/SCSS Guidelines

### Organization

- Use SCSS instead of plain CSS
- Organize styles from general to specific
- Use nesting, but limit to 3 levels deep
- Use variables for colors, spacing, etc.

### Naming Conventions

- Use BEM (Block Element Modifier) naming convention
- Use kebab-case for class names

```scss
.card {
  &__header {
    // Styles for card header
    
    &--highlighted {
      // Styles for highlighted header
    }
  }
  
  &__body {
    // Styles for card body
  }
}
```

### Mobile-First Approach

- Start with mobile styles
- Use media queries for larger screens
- Use relative units (rem, em, %) instead of pixels where possible

```scss
.container {
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
}
```

## Phaser Guidelines

### Scene Structure

- One scene per file
- Follow standard Phaser lifecycle methods
- Organize methods in the following order:
  1. Constructor
  2. init
  3. preload
  4. create
  5. update
  6. Custom methods

```javascript
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }
  
  init(data) {
    // Initialize scene with data
  }
  
  preload() {
    // Load assets
  }
  
  create() {
    // Create game objects
  }
  
  update(time, delta) {
    // Update logic
  }
  
  // Custom methods below
}
```

### Game Objects

- Create methods for spawning different types of game objects
- Use descriptive names for game objects
- Group related objects using Phaser.Group or containers
- Use a consistent coordinate system

```javascript
create() {
  this.createBoard();
  this.createUI();
  this.setupInput();
}

createBoard() {
  // Create game board
}

createUI() {
  // Create UI elements
}

setupInput() {
  // Setup input handlers
}
```

## Backend Guidelines

### API Structure

- Follow RESTful principles
- Use versioning in API paths (`/api/v1/...`)
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return consistent JSON responses

### Response Format

All API responses should follow this format:

```javascript
{
  "success": true, // boolean indicating success or failure
  "data": { ... }, // response data (null if error)
  "error": null    // error object if success is false, null otherwise
}
```

Error format:

```javascript
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Middleware

- Create reusable middleware for common tasks
- Use middleware for validation, authentication, logging, etc.
- Keep middleware focused on a single responsibility

### Service Layer

- Implement business logic in services
- Keep services independent of request/response objects
- Use dependency injection for external services
- Make services testable without HTTP context

## Testing Guidelines

### Unit Tests

- Test one unit of functionality at a time
- Mock external dependencies
- Follow the AAA pattern (Arrange, Act, Assert)
- Use descriptive test names

```javascript
describe('ScoreCalculator', () => {
  it('should multiply moves by difficulty multiplier', () => {
    // Arrange
    const moves = 5;
    const difficulty = 'hard';
    
    // Act
    const score = calculateScore(moves, difficulty);
    
    // Assert
    expect(score).toBe(50); // Assuming hard multiplier is 10
  });
});
```

### Integration Tests

- Test how components work together
- Minimize mocking
- Focus on boundaries between systems

### End-to-End Tests

- Test complete user flows
- Use headless browsers for UI testing
- Keep E2E tests focused on critical paths

## Documentation Guidelines

### JSDoc Comments

- Add JSDoc comments to all functions, classes, and components
- Include parameter descriptions, return values, and examples

```javascript
/**
 * Calculates player score based on moves and difficulty
 * 
 * @param {number} moves - Number of moves made by player
 * @param {string} difficulty - Game difficulty (easy, medium, hard)
 * @returns {number} Calculated score
 * @example
 * 
 * const score = calculateScore(5, 'medium');
 * // Returns: 25
 */
function calculateScore(moves, difficulty) {
  // Implementation
}
```

### README Files

- Include README files in major directories
- Explain the purpose and structure of the directory
- Provide examples where appropriate

## Git Commit Guidelines

- Write meaningful commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issue numbers when applicable
- Keep commits focused on a single change

For detailed Git workflow, see [Git Workflow](git-workflow.md).

## Editor Configuration

We use EditorConfig to maintain consistent coding styles:

```
root = true

[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
charset = utf-8
indent_style = space
indent_size = 2

[*.{js,svelte,json,css,scss}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

## Linting and Formatting

- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- Stylelint for CSS/SCSS linting

Ensure your editor is configured to use these tools, preferably with format-on-save enabled.

## Summary

This style guide is designed to create consistency across the codebase and improve maintainability. Following these guidelines will help create a cohesive and high-quality codebase.

If you have questions or suggestions for the style guide, please discuss with the team.