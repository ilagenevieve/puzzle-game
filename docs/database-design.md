# Database Design

This document details the database schema design for Ocean of Puzzles.

## Overview

Ocean of Puzzles uses SQLite as its database engine. The schema is designed to efficiently store user data, game information, and statistics while maintaining appropriate relationships between entities.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│             │       │             │       │             │
│    users    │───┐   │    games    │──────►│  game_types │
│             │   │   │             │       │             │
└─────────────┘   │   └─────────────┘       └─────────────┘
       ▲           │          ▲
       │           │          │
       │           │          │
┌─────────────┐   │   ┌─────────────┐
│             │   │   │             │
│  user_stats │◄──┘   │  game_moves │
│             │       │             │
└─────────────┘       └─────────────┘
```

## Tables

### users

Stores user account information and authentication details.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_stats

Stores user gameplay statistics.

```sql
CREATE TABLE user_stats (
  user_id INTEGER PRIMARY KEY,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  games_drawn INTEGER DEFAULT 0,
  nim_played INTEGER DEFAULT 0,
  nim_won INTEGER DEFAULT 0,
  domineering_played INTEGER DEFAULT 0,
  domineering_won INTEGER DEFAULT 0,
  dots_boxes_played INTEGER DEFAULT 0,
  dots_boxes_won INTEGER DEFAULT 0,
  last_played_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### game_types

Defines the available types of games.

```sql
CREATE TABLE game_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  rules TEXT,
  min_players INTEGER DEFAULT 1,
  max_players INTEGER DEFAULT 2,
  config JSON,
  icon TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### games

Stores game instances, both active and completed.

```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_type_id INTEGER NOT NULL,
  status TEXT CHECK(status IN ('waiting', 'active', 'completed', 'aborted')) DEFAULT 'waiting',
  winner_id INTEGER,
  current_player_index INTEGER DEFAULT 0,
  state JSON,
  settings JSON,
  invitation_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  FOREIGN KEY (game_type_id) REFERENCES game_types(id),
  FOREIGN KEY (winner_id) REFERENCES users(id)
);
```

### game_players

Maps users to games (many-to-many relationship).

```sql
CREATE TABLE game_players (
  game_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  player_index INTEGER NOT NULL,
  player_type TEXT CHECK(player_type IN ('human', 'ai', 'guest')) DEFAULT 'human',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (game_id, user_id),
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### game_moves

Records each move made in a game for history and replay capability.

```sql
CREATE TABLE game_moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  user_id INTEGER,
  player_index INTEGER NOT NULL,
  move_data JSON NOT NULL,
  move_number INTEGER NOT NULL,
  state_after JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### sessions

Stores user session data for authentication.

```sql
CREATE TABLE sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expired TIMESTAMP NOT NULL
);
```

## Indexes

Important indexes for query optimization:

```sql
-- User search and authentication
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Game queries
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_invitation_code ON games(invitation_code);

-- Game player lookups
CREATE INDEX idx_game_players_user ON game_players(user_id);

-- Session expiration cleanup
CREATE INDEX idx_sessions_expired ON sessions(expired);
```

## Data Access Patterns

The application predominantly uses the following data access patterns:

1. **User Authentication**
   - Lookup user by username
   - Verify password hash
   - Create/validate session

2. **User Profile & Stats**
   - Fetch user profile data
   - Retrieve and update user statistics

3. **Game Management**
   - Create new games
   - Join existing games
   - Update game state
   - Record game moves
   - Complete games and update statistics

4. **Game History & Replays**
   - Fetch complete game history
   - Retrieve moves in sequence for replay

## Migrations

Database migrations are managed through SQL scripts in the `db/migrations` directory. Each migration is numbered sequentially and applied in order during database initialization.

A typical migration script includes both the forward migration and a corresponding rollback:

```sql
-- Forward migration
CREATE TABLE new_table (...);

-- Rollback
-- DROP TABLE new_table;
```

## Initialization

Database initialization is performed during application startup, ensuring the correct schema version is in place. Initial seed data for game types and other reference data is inserted during this process.

## Backup Strategy

See [Environment Setup](environment-setup.md#database-backup-strategy) for details on the database backup approach.

## Performance Considerations

- SQLite works well for the expected user load of this application
- Indexes are created on frequently queried fields
- JSON fields are used for flexible data storage (game state, settings)
- Query optimizations focus on the most common access patterns
- Write operations are kept minimal during active gameplay

## Future Enhancements

- Add caching layer for frequently accessed data
- Implement soft deletion for users and games
- Add more detailed statistics tables
- Create analytics views for gameplay trends
- Add scheduled database maintenance procedures