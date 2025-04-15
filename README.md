# 🌊 Ocean of Puzzles 🧩

![Ocean Waves](https://source.unsplash.com/800x200/?ocean,waves)

## 🐚 Dive Into the Deep Blue of Mathematical Puzzles

Welcome to **Ocean of Puzzles** - where mathematical challenges flow like gentle waves and strategic thinking runs as deep as the sea! This mobile-first browser game invites you to immerse yourself in classic mathematical puzzles while enjoying soothing ocean visuals and the gentle rhythm of strategic gameplay.

Whether you're riding solo against our AI dolphins or challenging a friend to a 1v1 match across the digital reef, Ocean of Puzzles provides a refreshing escape into the world of mathematical games.

## 🚧 Project Status

Ocean of Puzzles is currently under active development:

- ✅ **Phase 1: Foundation** - Complete
- ✅ **Phase 2: Authentication & Data Layer** - Complete
- 🔄 **Phase 3: Game Engine Integration** - Next Up
- 📅 **Phases 4-8** - Planned

See our [implementation status](docs/implementation-status.md) document for more details.

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
3. **Game Engine Bay** 🔄: Phaser integration and core game mechanics
4. **Game Implementation**: Individual game implementations
5. **Multiplayer Ocean**: P2P connections for 1v1 gameplay
6. **AI Islands**: Intelligent computer opponents
7. **Polish Lagoon**: Animations, sounds, and visual refinements
8. **Deployment Harbor**: Testing and launching to production

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Architecture Overview](docs/architecture.md)
- [Frontend Architecture](docs/frontend-architecture.md)
- [Database Design](docs/database-design.md)
- [Authentication](docs/authentication.md)
- [Implementation Status](docs/implementation-status.md)
- [Environment Setup](docs/environment-setup.md)

## 🤝 Contributing

We welcome contributions! Please check our [contribution guidelines](docs/dev-workflow/git-workflow.md) before getting started.

## 🏖️ Join Our Ocean Adventure

Ocean of Puzzles is a relaxing journey through mathematical challenges, designed to soothe your mind while engaging your strategic thinking. The calming ocean theme provides a perfect backdrop for these classic games, creating a meditative experience that's both challenging and refreshing.

Dive in, the water's fine! 🌊

---

*Developed with love and ocean dreams. May your puzzling be as peaceful as waves on the shore.*