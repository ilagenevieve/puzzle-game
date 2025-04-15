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
- 📅 **Phases 6-9** - Planned

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

- **Game Engine**: Phaser 3 (powering our underwater animations)
- **Frontend**: Svelte + Vite (creating waves of responsive UI)
- **Backend**: Node.js + Express (the deep currents supporting our ocean)
- **Database**: SQLite (storing treasures of game progress)
- **Multiplayer**: PeerJS (WebRTC) for direct gameplay, Socket.io for signaling (connecting players across the vast ocean)
- **Authentication**: Session-based with secure HTTP-only cookies
- **Styling**: SCSS with ocean-themed variables and responsive design

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

### 🐞 Development with Enhanced Logging

For local development with comprehensive error logging:

```bash
# Interactive development menu with multiple options
npm run start:dev

# Start with enhanced logging (outputs to terminal and log files)
npm run dev:logs

# Run checks first, then start with enhanced logging
npm run dev:check
```

The interactive development menu provides these options:
1. Standard Mode - Simple concurrent development
2. Enhanced Mode - With detailed logging and error tracking
3. Check & Run - Run checks first, then start with enhanced logging
4. Frontend Only - Run only the frontend
5. Backend Only - Run only the backend

The enhanced development mode:
- Starts both frontend and backend with proper error handling
- Captures and highlights errors in real-time
- Saves all logs to the `logs/` directory for later inspection
- Provides color-coded output for easier debugging
- Robust error detection and detailed feedback

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
6. **Multiplayer Ocean**: P2P connections for 1v1 gameplay
7. **AI Islands**: Intelligent computer opponents
8. **Polish Lagoon**: Animations, sounds, and visual refinements
9. **Deployment Harbor**: Testing and launching to production

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

We welcome contributions! Please check our [contribution guidelines](docs/dev-workflow/git-workflow.md) before getting started.

## 🏖️ Join Our Ocean Adventure

Ocean of Puzzles is a relaxing journey through mathematical challenges, designed to soothe your mind while engaging your strategic thinking. The calming ocean theme provides a perfect backdrop for these classic games, creating a meditative experience that's both challenging and refreshing.

Dive in, the water's fine! 🌊

---

*Developed with love and ocean dreams. May your puzzling be as peaceful as waves on the shore.*