# Frontend Architecture

This document outlines the frontend architecture of Ocean of Puzzles.

## Overview

The frontend of Ocean of Puzzles is built with Svelte, a reactive JavaScript framework, and employs a component-based architecture with clear separation of concerns.

## Technology Stack

- **Framework**: Svelte + Vite
- **Routing**: svelte-navigator
- **State Management**: Svelte stores
- **Styling**: SCSS with BEM methodology
- **Game Engine**: Phaser 3 (planned)
- **HTTP Client**: Fetch API
- **Real-time Communication**: Socket.io Client + PeerJS

## Directory Structure

```
frontend/
├── public/             # Static assets served as-is
├── src/
│   ├── assets/         # Static assets processed by build system
│   │   ├── images/     # Image assets
│   │   └── styles/     # Global styles and variables
│   ├── components/     # Reusable UI components
│   │   ├── auth/       # Authentication-related components
│   │   ├── game/       # Game UI components
│   │   ├── layout/     # Layout components (Header, Footer)
│   │   └── shared/     # Shared UI elements (Button, Card, etc.)
│   ├── game/           # Phaser game implementation
│   │   ├── scenes/     # Game scenes
│   │   ├── objects/    # Game objects
│   │   └── config/     # Game configuration
│   ├── routes/         # Page components (Home, Login, etc.)
│   ├── services/       # API and business logic services
│   │   ├── api.js      # API client
│   │   └── game/       # Game logic services
│   ├── stores/         # Svelte stores for state management
│   ├── utils/          # Utility functions
│   ├── App.svelte      # Root component
│   └── main.js         # Application entry point
├── tests/              # Tests directory
│   ├── e2e/           # End-to-end tests
│   └── unit/          # Unit tests
└── vite.config.js      # Vite configuration
```

## Architecture Layers

### 1. Component Layer

Components are the building blocks of the UI and follow these principles:

- **Self-contained**: Each component includes its own styling and logic
- **Single responsibility**: Components focus on one specific task
- **Composable**: Complex UIs are built by composing simpler components
- **Reusable**: Generic components are designed for reuse across the application

Example component hierarchy:

```
App
├── Layout
│   ├── Header
│   └── Footer
├── Pages
│   ├── Home
│   ├── Login
│   ├── Register
│   ├── Dashboard
│   ├── Profile
│   └── GameLobby
└── GameContainer
    └── [Phaser Game Instance]
```

### 2. Routing Layer

Routing is handled by svelte-navigator and organized as follows:

- Public routes accessible to all users
- Protected routes that require authentication
- Route parameters for dynamic content
- Route guards (AuthGuard) for access control

Example routing configuration:

```svelte
<Router>
  <Header />
  
  <!-- Public Routes -->
  <Route path="/" component={Home} />
  <Route path="/login" component={Login} />
  <Route path="/register" component={Register} />
  <Route path="/about" component={About} />
  
  <!-- Protected Routes -->
  <Route path="/dashboard">
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  </Route>
  
  <Route path="/profile">
    <AuthGuard>
      <Profile />
    </AuthGuard>
  </Route>
  
  <Route path="/games">
    <AuthGuard>
      <GameLobby />
    </AuthGuard>
  </Route>
  
  <!-- 404 Route -->
  <Route path="*" component={NotFound} />
  
  <Footer />
</Router>
```

### 3. State Management Layer

State is managed using Svelte's built-in stores and follows these patterns:

- **User Store**: Manages authentication state and user data
- **Game Store**: Manages game state during gameplay
- **UI Store**: Manages global UI state (theme, notifications, etc.)
- **Local Component State**: For component-specific state

Example of a Svelte store:

```javascript
// user-store.js
import { writable, derived } from 'svelte/store';

const createUserStore = () => {
  const { subscribe, set, update } = writable({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });

  return {
    subscribe,
    setUser: (userData) => {
      set({
        isAuthenticated: true,
        user: userData,
        loading: false,
        error: null,
      });
    },
    clearUser: () => {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    },
    // Additional methods...
  };
};

export const userStore = createUserStore();

// Derived stores
export const isAuthenticated = derived(
  userStore,
  $userStore => $userStore.isAuthenticated
);
```

### 4. Service Layer

Services encapsulate API calls and business logic:

- **API Service**: Handles HTTP requests and responses
- **Auth Service**: Manages authentication operations
- **Game Service**: Implements game logic and communication
- **Socket Service**: Manages WebSocket connections

Example API service:

```javascript
// api.js
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function apiRequest(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // For cookies
  };

  const fetchOptions = { ...defaultOptions, ...options };
  
  if (fetchOptions.body && typeof fetchOptions.body === 'object') {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, fetchOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Something went wrong');
  }

  return data;
}

// Authentication functions
export async function login(username, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

// Additional API functions...
```

### 5. Game Engine Layer

The game engine layer integrates Phaser with Svelte:

- **Game Container**: Svelte component that hosts the Phaser game
- **Game Config**: Phaser configuration and setup
- **Scenes**: Game screens and states
- **Game Objects**: Interactive elements within the game

## Key Components

### AuthGuard

The AuthGuard component protects routes that require authentication:

```svelte
<!-- AuthGuard.svelte -->
<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-navigator';
  import { isAuthenticated, userStore } from '../stores/user-store';
  import { getCurrentUser } from '../services/api';
  
  export let requiredAuth = true;
  export let redirectTo = '/login';
  export let onAuthSuccess = null;
  
  // Initially allow if auth not required
  let authSuccessful = !requiredAuth;
  
  onMount(async () => {
    try {
      const response = await getCurrentUser();
      
      if (response && response.data && response.data.user) {
        userStore.setUser(response.data.user);
        authSuccessful = true;
        
        if (onAuthSuccess && typeof onAuthSuccess === 'function') {
          onAuthSuccess(response.data.user);
        }
      } else if (requiredAuth) {
        navigate(redirectTo, { replace: true });
      } else {
        authSuccessful = true;
      }
    } catch (error) {
      if (requiredAuth) {
        navigate(redirectTo, { replace: true });
      } else {
        authSuccessful = true;
      }
    }
  });
</script>

{#if authSuccessful}
  <slot></slot>
{:else}
  <div class="authenticating">
    <div class="loading-indicator"></div>
    <p>Authenticating...</p>
  </div>
{/if}
```

### Dashboard

The Dashboard component shows user statistics and quick actions:

```svelte
<!-- Dashboard.svelte -->
<script>
  import { isAuthenticated, displayName } from '../stores/user-store';
  import { getUserStats } from '../services/api';
  import { onMount } from 'svelte';
  
  let stats = null;
  let loading = true;
  let error = null;
  
  onMount(async () => {
    try {
      loading = true;
      const response = await getUserStats();
      stats = response.data.stats;
    } catch (err) {
      error = err.message || 'Failed to load statistics';
    } finally {
      loading = false;
    }
  });
</script>

<section class="dashboard">
  <div class="welcome-card">
    <h1>Welcome, {$displayName}!</h1>
    <p>Your mathematical puzzle adventure awaits.</p>
  </div>
  
  <!-- Statistics and quick actions -->
  <!-- ... -->
</section>
```

## Styling Approach

The application uses SCSS with the following approach:

- **Variables**: Global SCSS variables for colors, spacing, etc.
- **Mixins**: Reusable CSS patterns
- **BEM Methodology**: Block-Element-Modifier naming convention
- **Scoped Styles**: Component-specific styles using Svelte's style encapsulation
- **Responsive Design**: Mobile-first approach with breakpoints

Example SCSS structure:

```scss
// variables.scss
:root {
  // Color palette
  --ocean-primary: #1a73e8;
  --ocean-secondary: #0d47a1;
  --ocean-accent: #00acc1;
  --ocean-background: #f5f7f9;
  --ocean-text: #202124;
  
  // Typography
  --font-family: 'Roboto', sans-serif;
  --font-size-base: 16px;
  
  // Spacing
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  // Breakpoints
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
}
```

## Form Handling

Forms follow these patterns:

- Client-side validation before submission
- Server-side validation confirmation
- Loading states during form submission
- Clear error messages for validation failures
- Success feedback after successful operations

## Responsive Design

The application follows a mobile-first approach:

- Base styles for mobile devices
- Media queries for larger screens
- Flexible layouts using CSS Grid and Flexbox
- Responsive typography with rem units
- Adaptive navigation with mobile menu

## Game Integration

Phaser is integrated with Svelte using the following approach:

1. A Svelte component creates and mounts the Phaser game instance
2. Svelte components receive game events via custom event dispatching
3. Game state is shared with Svelte components via stores
4. The game canvas responds to viewport changes for responsive gameplay

## Performance Optimization

Performance optimizations include:

- Code splitting for lazily loading routes and components
- Asset optimization for images and other static resources
- Efficient reactivity using Svelte's compiled approach
- Minimizing DOM updates with proper component design
- Web Workers for computationally intensive tasks (AI calculations)

## Accessibility

Accessibility considerations include:

- Semantic HTML elements
- ARIA attributes where necessary
- Keyboard navigation support
- Color contrast meeting WCAG standards
- Focus management for interactive elements

## Testing Strategy

See [Testing Standards](dev-workflow/testing-standards.md) for details on the frontend testing approach.

## Browser Support

The application targets modern browsers with good ES6+ support:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- iOS Safari and Chrome (latest 2 versions)
- Android Chrome and Firefox (latest 2 versions)