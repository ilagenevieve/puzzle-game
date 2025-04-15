# Authentication

This document describes the authentication system implemented in Ocean of Puzzles.

## Overview

Ocean of Puzzles uses a session-based authentication system with secure HTTP-only cookies. The authentication flow follows industry best practices for security while maintaining a smooth user experience.

## Authentication Flow

```
┌──────────┐      ┌────────────┐      ┌────────────┐
│          │      │            │      │            │
│  Client  │<────►│  Backend   │<────►│  Database  │
│          │      │            │      │            │
└──────────┘      └────────────┘      └────────────┘
```

1. User submits credentials (username/password)
2. Backend validates credentials against the database
3. If valid, server creates a session and sets a secure cookie
4. Session ID is stored in the database with user information
5. Client includes the cookie in subsequent requests
6. Backend validates the session on each protected request

## Implementation Details

### Backend (Node.js/Express)

- Session management using `express-session`
- Session storage in SQLite using `connect-sqlite3`
- Password hashing with `bcrypt` (10 rounds)
- CSRF protection with the `csurf` middleware
- Secure, HTTP-only cookies with appropriate flags

### Frontend (Svelte)

- Authentication state managed in Svelte store
- Protected routes using the `AuthGuard` component
- Automatic session validation on application start
- Redirect to login for unauthenticated users
- User interface feedback for authentication operations

## API Endpoints

### Registration

```
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "username": "oceanexplorer",
  "email": "user@example.com",
  "password": "secure_password_here"
}
```

**Response (Success - 201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "oceanexplorer",
      "email": "user@example.com",
      "display_name": "oceanexplorer",
      "created_at": "2023-09-15T12:00:00Z"
    }
  }
}
```

### Login

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "username": "oceanexplorer",
  "password": "secure_password_here"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "oceanexplorer",
      "email": "user@example.com",
      "display_name": "Ocean Explorer",
      "created_at": "2023-09-15T12:00:00Z"
    }
  }
}
```

### Get Current User

```
GET /api/v1/users/me
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "oceanexplorer",
      "email": "user@example.com",
      "display_name": "Ocean Explorer",
      "created_at": "2023-09-15T12:00:00Z"
    }
  }
}
```

**Response (Unauthorized - 401):**
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

### Logout

```
POST /api/v1/auth/logout
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

## Protected Routes

### Frontend Routes

The following frontend routes are protected and require authentication:

- `/dashboard` - User dashboard with statistics and quick actions
- `/profile` - User profile management
- `/games` - Game lobby and selection
- `/game/:id` - Active game view

### AuthGuard Component

The AuthGuard component wraps protected routes in the frontend and ensures that only authenticated users can access them:

```svelte
<Route path="/dashboard">
  <AuthGuard>
    <Dashboard />
  </AuthGuard>
</Route>
```

If an unauthenticated user attempts to access a protected route, they are redirected to the login page.

## Session Management

- Sessions are stored in the SQLite database
- Default session duration: 7 days
- Inactive session timeout: 30 minutes
- Sessions are invalidated on logout or password change
- New sessions are created on login

## Security Considerations

- Passwords are never stored in plaintext
- Bcrypt with appropriate work factor prevents brute force attacks
- HTTP-only cookies prevent JavaScript access to session tokens
- CSRF tokens protect against cross-site request forgery
- Secure flag ensures cookies only sent over HTTPS (in production)
- SameSite cookie attribute prevents cross-site cookie attacks
- Rate limiting on auth endpoints prevents brute force attempts
- Sessions can be revoked server-side if needed

## Error Handling

All authentication errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

Common error codes include:

- `INVALID_CREDENTIALS` - Username or password is incorrect
- `USER_EXISTS` - Username or email already exists
- `UNAUTHORIZED` - Authentication required
- `VALIDATION_ERROR` - Invalid input data

## Future Enhancements

- OAuth integration for social login
- Two-factor authentication
- Password reset functionality
- Account verification via email
- Session management UI for users
- Graduated rate limiting with IP tracking