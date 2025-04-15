# API Reference

This document provides a comprehensive reference for the Ocean of Puzzles API.

## API Overview

The Ocean of Puzzles API follows RESTful principles and uses standard HTTP methods. All endpoints return data in JSON format with a consistent response structure.

### Base URL

```
/api/v1
```

### Authentication

Most endpoints require authentication via session cookies. These are set automatically when logging in through the `/auth/login` endpoint and included in subsequent requests.

### Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

In case of an error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Authentication Endpoints

### Register User

```
POST /auth/register
```

**Request Body:**

```json
{
  "username": "oceanexplorer",
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "oceanexplorer",
      "email": "user@example.com",
      "display_name": "oceanexplorer",
      "created_at": "2023-09-01T12:00:00Z"
    }
  },
  "error": null
}
```

**Possible Errors:**
- `USER_EXISTS` (409): Username or email already exists
- `VALIDATION_ERROR` (400): Invalid input data

### Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "username": "oceanexplorer",
  "password": "secure_password"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "oceanexplorer",
      "email": "user@example.com",
      "display_name": "oceanexplorer",
      "created_at": "2023-09-01T12:00:00Z"
    }
  },
  "error": null
}
```

**Possible Errors:**
- `INVALID_CREDENTIALS` (401): Username or password is incorrect
- `ACCOUNT_LOCKED` (403): Account is locked due to too many failed attempts

### Logout

```
POST /auth/logout
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  },
  "error": null
}
```

## User Endpoints

### Get Current User

```
GET /users/me
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "oceanexplorer",
      "email": "user@example.com",
      "display_name": "Ocean Explorer",
      "created_at": "2023-09-01T12:00:00Z"
    }
  },
  "error": null
}
```

**Possible Errors:**
- `UNAUTHORIZED` (401): User is not authenticated

### Update User Profile

```
PUT /users/profile
```

**Request Body:**

```json
{
  "display_name": "Ocean Explorer",
  "email": "newemail@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "oceanexplorer",
      "email": "newemail@example.com",
      "display_name": "Ocean Explorer",
      "created_at": "2023-09-01T12:00:00Z",
      "updated_at": "2023-09-02T12:00:00Z"
    }
  },
  "error": null
}
```

**Possible Errors:**
- `UNAUTHORIZED` (401): User is not authenticated
- `VALIDATION_ERROR` (400): Invalid input data
- `EMAIL_EXISTS` (409): Email already in use by another account

### Change Password

```
PUT /users/password
```

**Request Body:**

```json
{
  "current_password": "current_password",
  "new_password": "new_secure_password"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  },
  "error": null
}
```

**Possible Errors:**
- `UNAUTHORIZED` (401): User is not authenticated
- `INVALID_PASSWORD` (400): Current password is incorrect
- `VALIDATION_ERROR` (400): New password does not meet requirements

### Get User Statistics

```
GET /users/stats
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalGames": 42,
      "wins": 24,
      "losses": 16,
      "draws": 2,
      "winRate": "57%",
      "rankingPosition": 12,
      "gameTypeStats": {
        "nim": {
          "played": 15,
          "won": 8
        },
        "domineering": {
          "played": 18,
          "won": 10
        },
        "dots_and_boxes": {
          "played": 9,
          "won": 6
        }
      }
    }
  },
  "error": null
}
```

**Possible Errors:**
- `UNAUTHORIZED` (401): User is not authenticated

## Game Endpoints

### Get Game Types

```
GET /games/types
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "gameTypes": [
      {
        "id": 1,
        "name": "Nim",
        "slug": "nim",
        "description": "A mathematical game of strategy",
        "icon": "🔢",
        "min_players": 2,
        "max_players": 2
      },
      {
        "id": 2,
        "name": "Domineering",
        "slug": "domineering",
        "description": "A territorial abstract strategy game",
        "icon": "📏",
        "min_players": 2,
        "max_players": 2
      },
      {
        "id": 3,
        "name": "Dots and Boxes",
        "slug": "dots_and_boxes",
        "description": "Connect dots to form boxes",
        "icon": "📦",
        "min_players": 2,
        "max_players": 2
      }
    ]
  },
  "error": null
}
```

### Create Game

```
POST /games
```

**Request Body:**

```json
{
  "gameTypeId": 1,
  "settings": {
    "difficulty": "medium",
    "aiOpponent": true
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "game": {
      "id": 42,
      "gameTypeId": 1,
      "status": "active",
      "currentPlayerIndex": 0,
      "settings": {
        "difficulty": "medium",
        "aiOpponent": true
      },
      "createdAt": "2023-09-10T15:30:00Z",
      "startedAt": "2023-09-10T15:30:00Z"
    }
  },
  "error": null
}
```

**Possible Errors:**
- `UNAUTHORIZED` (401): User is not authenticated
- `VALIDATION_ERROR` (400): Invalid input data
- `GAME_TYPE_NOT_FOUND` (404): Game type not found

### Get Game

```
GET /games/:gameId
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "game": {
      "id": 42,
      "gameTypeId": 1,
      "gameName": "Nim",
      "status": "active",
      "currentPlayerIndex": 0,
      "state": {
        "board": [[3, 5, 7]],
        "lastMove": null
      },
      "settings": {
        "difficulty": "medium",
        "aiOpponent": true
      },
      "players": [
        {
          "id": 1,
          "username": "oceanexplorer",
          "displayName": "Ocean Explorer"
        },
        {
          "id": null,
          "username": "ai_opponent",
          "displayName": "AI Opponent"
        }
      ],
      "moves": [],
      "createdAt": "2023-09-10T15:30:00Z",
      "startedAt": "2023-09-10T15:30:00Z"
    }
  },
  "error": null
}
```

**Possible Errors:**
- `UNAUTHORIZED` (401): User is not authenticated
- `GAME_NOT_FOUND` (404): Game not found
- `ACCESS_DENIED` (403): User not allowed to view this game

### Make Move

```
POST /games/:gameId/move
```

**Request Body:**

```json
{
  "move": {
    "row": 0,
    "count": 2
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "game": {
      "id": 42,
      "status": "active",
      "currentPlayerIndex": 1,
      "state": {
        "board": [[1, 5, 7]],
        "lastMove": {
          "player": 0,
          "row": 0,
          "count": 2
        }
      },
      "moves": [
        {
          "playerIndex": 0,
          "move": {
            "row": 0,
            "count": 2
          },
          "timestamp": "2023-09-10T15:31:00Z"
        }
      ]
    }
  },
  "error": null
}
```

**Possible Errors:**
- `UNAUTHORIZED` (401): User is not authenticated
- `GAME_NOT_FOUND` (404): Game not found
- `INVALID_MOVE` (400): The move is not valid
- `NOT_YOUR_TURN` (403): It's not the user's turn
- `GAME_OVER` (400): The game has already ended

### Create Game Invitation

```
POST /games/invitation
```

**Request Body:**

```json
{
  "gameTypeId": 1,
  "settings": {
    "boardSize": "medium"
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "invitation": {
      "gameId": 43,
      "code": "ABCDEF",
      "expiresAt": "2023-09-10T16:30:00Z"
    }
  },
  "error": null
}
```

**Possible Errors:**
- `UNAUTHORIZED` (401): User is not authenticated
- `VALIDATION_ERROR` (400): Invalid input data
- `GAME_TYPE_NOT_FOUND` (404): Game type not found

### Accept Game Invitation

```
POST /games/invitation/:code/accept
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "game": {
      "id": 43,
      "gameTypeId": 1,
      "gameName": "Nim",
      "status": "active",
      "currentPlayerIndex": 0,
      "state": {
        "board": [[3, 5, 7]],
        "lastMove": null
      },
      "players": [
        {
          "id": 1,
          "username": "oceanexplorer",
          "displayName": "Ocean Explorer"
        },
        {
          "id": 2,
          "username": "wavesurfer",
          "displayName": "Wave Surfer"
        }
      ],
      "createdAt": "2023-09-10T15:45:00Z",
      "startedAt": "2023-09-10T15:50:00Z"
    }
  },
  "error": null
}
```

**Possible Errors:**
- `UNAUTHORIZED` (401): User is not authenticated
- `INVITATION_NOT_FOUND` (404): Invitation not found or expired
- `INVITATION_ALREADY_ACCEPTED` (400): Invitation already accepted

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User is not authenticated |
| `ACCESS_DENIED` | 403 | User does not have permission for this action |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `USER_EXISTS` | 409 | Username or email already exists |
| `INVALID_CREDENTIALS` | 401 | Username or password is incorrect |
| `ACCOUNT_LOCKED` | 403 | Account is locked due to too many failed attempts |
| `INVALID_PASSWORD` | 400 | Current password is incorrect |
| `EMAIL_EXISTS` | 409 | Email already in use by another account |
| `GAME_TYPE_NOT_FOUND` | 404 | Game type not found |
| `GAME_NOT_FOUND` | 404 | Game not found |
| `INVALID_MOVE` | 400 | The move is not valid |
| `NOT_YOUR_TURN` | 403 | It's not the user's turn |
| `GAME_OVER` | 400 | The game has already ended |
| `INVITATION_NOT_FOUND` | 404 | Invitation not found or expired |
| `INVITATION_ALREADY_ACCEPTED` | 400 | Invitation already accepted |

## Pagination

Endpoints that return lists of items support pagination using the following query parameters:

- `page`: Page number (1-based)
- `limit`: Number of items per page

Example:

```
GET /games?page=2&limit=10
```

Paginated responses include metadata:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 10,
      "totalItems": 42,
      "totalPages": 5
    }
  },
  "error": null
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Rate limits are applied per user and per IP address.

When a rate limit is exceeded, the API returns a 429 Too Many Requests response with a Retry-After header indicating how long to wait before trying again.