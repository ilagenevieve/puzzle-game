# 🌊 Ocean of Puzzles 🧩

![Ocean Waves](https://source.unsplash.com/800x200/?ocean,waves)

## 🐚 Dive Into the Deep Blue of Mathematical Puzzles

Welcome to **Ocean of Puzzles** - where mathematical challenges flow like gentle waves and strategic thinking runs as deep as the sea! This mobile-first browser game invites you to immerse yourself in classic mathematical puzzles while enjoying soothing ocean visuals and the gentle rhythm of strategic gameplay.

Whether you're riding solo against our AI dolphins or challenging a friend to a 1v1 match across the digital reef, Ocean of Puzzles provides a refreshing escape into the world of mathematical games.

## 🚧 Project Status

Ocean of Puzzles is currently under active development:

- ✅ **Phase 1: Foundation** - Complete
- ✅ **Phase 2: Authentication & Data Layer** - Complete
- ✅ **Phase 3: Frontend Framework & UI** - Complete
- ✅ **Phase 4: Game Engine Integration** - Complete
- 🔄 **Phase 5: Game Implementations** - In Progress (20%)
- 🔄 **Phase 6: Development Workflow** - In Progress (90%)
  - ✅ Ocean-themed development scripts
  - ✅ Branch management tools
  - ✅ Solo developer CI/CD workflow
  - ✅ Node.js version compatibility checks
- 📅 **Phases 7-9** - Planned

See our [implementation status](IMPLEMENTATION_STATUS.md) document for a detailed breakdown of progress.

## 🐠 Features That Shimmer Like Ocean Treasures

- 🌊 **Mobile-First Design**: Enjoy smooth sailing on any device with our responsive, touch-friendly interface
- 🐬 **AI Opponents**: Challenge our intelligent sea creatures with varying difficulty levels
- 🐙 **Multiplayer Matches**: Connect with friends for 1v1 battles across the digital ocean
- 🐟 **Multiple Puzzle Types**: Explore different mathematical games like nim, domineering, and dots-and-boxes
- 🦀 **User Accounts**: Track your voyage through our puzzle ocean with personal progress tracking
- 🐚 **Modern Visuals**: Immerse yourself in calming ocean-themed animations and effects
- 🧜‍♀️ **Offline Play**: Continue your puzzle adventures even when you drift away from connectivity

## 🌴 Technology Reef

Our puzzle ocean is built upon a carefully selected reef of technologies:

- **Game Engine**: Phaser 3 v3.70.0 (powering our underwater animations)
- **Frontend**: Svelte 4 + Vite 5 (creating waves of responsive UI)
- **Backend**: Node.js + Express (the deep currents supporting our ocean)
- **Database**: better-sqlite3 v11.9.1 (storing treasures of game progress)
- **Multiplayer**: PeerJS v1.5.2 for direct gameplay, Socket.io v4.7.4 for signaling
- **Authentication**: Express session with secure HTTP-only cookies
- **Styling**: SCSS with ocean-themed variables and responsive design

> **Node.js Compatibility**: We support all modern Node.js versions (v18, v20, v22+). The project uses the latest package versions (as of April 2025) for optimal compatibility and features.

## 🏝️ Setting Sail (Setup)

To dive into development:

1. Clone the repository to your local shore:
   ```bash
   git clone https://github.com/yourusername/puzzle-game.git
   ```

2. Navigate to the project's harbor:
   ```bash
   cd puzzle-game
   ```

3. Copy `.env.example` to `.env` and fill with your local treasures:
   ```bash
   cp .env.example .env
   ```

4. Launch your development vessel:
   ```bash
   docker-compose up --build
   ```

5. Visit `http://localhost:3000` to begin your puzzle voyage

### 🧪 Running Tests

Test your ocean voyage before setting sail:

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend

# Run with coverage reports
cd frontend && npm run test:coverage
cd backend && npm run test:coverage
```

### 🔍 Code Quality Checks

Ensure your code meets our quality standards:

```bash
# Run linting checks
npm run lint

# Run type checking (frontend)
npm run typecheck

# Run all build checks
npm run check
```

### 🐞 Ocean-Themed Interactive Development

Dive into our soothing ocean-themed development environment:

```bash
# Launch the interactive ocean-themed development navigator
npm run start:dev

# Start with enhanced logging and ocean visuals
npm run dev:logs

# Run quality checks first, then start with enhanced logging
npm run dev:check
```

The interactive ocean-themed development navigator offers:
1. 🌊 **Calm Waters** - Standard development (frontend + backend)
2. 🔍 **Deep Dive** - Enhanced mode with detailed logging
3. 🧪 **Treasure Hunter** - Run checks first, then start development
4. 🏄‍♂️ **Surfing** - Frontend only (UI development)
5. 🐠 **Coral Reef** - Backend only (API development)

Our enhanced ocean-themed development environment features:
- Colorful ocean-themed terminal displays with marine life visuals
- Intelligent component startup with wave-like progress indicators
- Real-time error detection that bubbles up like ocean currents
- Automatic dependency detection and installation (including nodemon)
- All logs saved to the `logs/` directory like treasures in a chest
- Color-coded output that mimics the peaceful colors of the ocean
- Robust error handling with friendly marine-themed messages
- Automatic directory creation and permission setup

For more detailed setup instructions, check our [environment setup guide](docs/environment-setup.md).

## 🐳 Puzzle Currents (Game Types)

### Nim
Like collecting shells on the beach, Nim challenges you to take the last treasure from the sand. Strategic thinking and foresight will determine who claims the final prize.

### Domineering
Stake your claim on the ocean floor by placing your pieces strategically. Block your opponent's path like coral formations while creating your own flowing patterns.

### Dots-and-Boxes
Connect the dots like mapping stars across the night ocean sky. Complete boxes to claim territory in this classic game of spatial awareness.

## 🗺️ Project Structure

The project follows a monorepo structure:

```
puzzle-game/
├── frontend/           # Svelte frontend application
├── backend/            # Express backend API
├── docs/               # Project documentation
│   ├── architecture.md
│   ├── implementation-status.md
│   └── ...
├── docker-compose.yml  # Development environment
└── README.md           # You are here!
```

## 🌊 Voyage Map (Development Roadmap)

Our journey across the puzzle ocean follows these currents:

1. **Foundation Shores** ✅: Development environment and core architecture
2. **Authentication Cove** ✅: User accounts and data persistence
3. **Frontend Framework Bay** ✅: UI components, forms, responsive layouts
4. **Game Engine Reef** ✅: Phaser integration and game scene architecture
5. **Game Implementation Waters** 🔄: Individual game implementations (Nim complete)
6. **Developer Workflow Beach** 🔄: Ocean-themed tools and streamlined solo development
   - Ocean-themed development scripts ✅
   - Branch management utilities ✅
   - Optimized CI/CD for solo development ✅
   - Node.js version compatibility checks ✅
7. **Multiplayer Ocean**: P2P connections for 1v1 gameplay
8. **AI Islands**: Intelligent computer opponents
9. **Polish Lagoon**: Animations, sounds, and visual refinements
10. **Deployment Harbor**: Testing and launching to production

## 📚 Documentation

Our project documentation follows a single source of truth principle:

- [Implementation Status](IMPLEMENTATION_STATUS.md): Master tracking document for project progress
- [Architecture Overview](docs/architecture.md): System architecture and design decisions
- [Frontend Architecture](docs/frontend-architecture.md): Detailed frontend architecture
- [Backend Architecture](docs/backend-architecture.md): Detailed backend architecture
- [Database Design](docs/database-design.md): Database schema and relationships
- [Authentication](docs/authentication.md): Security implementation
- [Environment Setup](docs/environment-setup.md): Development environment guide

See the [documentation index](docs/README.md) for the complete structure.

## 🤝 Contributing

We welcome contributions! Please check our [contribution guidelines](docs/dev-workflow/git-workflow.md) and [branch management guide](docs/dev-workflow/branch-management.md) before getting started.

To keep the repository clean, we provide several helpful branch management tools:

```bash
# Interactive ocean-themed branch cleanup utility
npm run branches:cleanup

# Quick cleanup of local merged branches
npm run branches:clean-local

# Interactive cleanup of remote branches
npm run branches:clean-remote

# Sync local branches with remote (fetch, prune, pull develop and main)
npm run branches:sync
```

These tools help maintain a clean repository and streamline the solo developer workflow.

## 🏖️ Join Our Ocean Adventure

Ocean of Puzzles is a relaxing journey through mathematical challenges, designed to soothe your mind while engaging your strategic thinking. The calming ocean theme provides a perfect backdrop for these classic games, creating a meditative experience that's both challenging and refreshing.

Dive in, the water's fine! 🌊

---

*Developed with love and ocean dreams. May your puzzling be as peaceful as waves on the shore.*