# Testing Standards

This document outlines the testing standards and approaches for the Ocean of Puzzles project.

## Testing Philosophy

The Ocean of Puzzles testing strategy follows these principles:

1. **Test-Driven Development**: Write tests before implementation when possible
2. **Balanced Coverage**: Focus testing efforts on critical functionality
3. **Automated Testing**: Maximize automation for regression prevention
4. **End-User Focus**: Test from the user's perspective
5. **Continuous Testing**: Run tests as part of the development workflow

## Testing Pyramid

Our testing strategy follows the testing pyramid approach:

```
    ▲
   ╱ ╲    E2E Tests (10%)
  ╱───╲
 ╱     ╲   Integration Tests (30%)
╱       ╲
─────────   Unit Tests (60%)
```

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test complete user flows

## Test Types

### Unit Tests

- **Frontend**: Components, stores, utility functions
- **Backend**: Controllers, services, models, utility functions
- **Game Logic**: Game rules, move validation, state transitions

### Integration Tests

- **API Tests**: Test API endpoints with real requests
- **Database Tests**: Test database operations
- **Component Integration**: Test interactions between related components

### End-to-End Tests

- **User Flows**: Complete scenarios from user perspective
- **Game Flows**: Complete game scenarios
- **Cross-Browser Testing**: Test on multiple browsers and devices

## Testing Tools

### Frontend Testing

- **Test Runner**: Vitest
- **Component Testing**: Testing Library (Svelte Testing Library)
- **E2E Testing**: Playwright
- **Mock Service Worker**: For API mocking

### Backend Testing

- **Test Runner**: Jest
- **API Testing**: Supertest
- **Database**: In-memory SQLite for tests

### Game Logic Testing

- **Test Framework**: Jest
- **State Testing**: Custom test utilities for game state

## Testing Structure

### Directory Structure

```
├── frontend/
│   └── tests/
│       ├── unit/
│       │   ├── components/
│       │   ├── stores/
│       │   └── utils/
│       └── e2e/
│           └── flows/
├── backend/
│   └── tests/
│       ├── unit/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── models/
│       │   └── utils/
│       ├── integration/
│       │   ├── api/
│       │   └── db/
│       └── e2e/
└── shared/
    └── tests/
        └── game-logic/
```

### Naming Conventions

- **Unit Tests**: `[filename].test.js` or `[filename].spec.js`
- **Test Files**: Match the structure and naming of source files
- **Test Cases**: Should be descriptive and follow the pattern `"should [expected behavior] when [condition]"`

## Writing Tests

### Unit Test Example (Frontend Component)

```javascript
// Button.test.js
import { render, fireEvent } from '@testing-library/svelte';
import Button from '../src/components/shared/Button.svelte';

describe('Button Component', () => {
  it('should render the button with the provided label', () => {
    const { getByText } = render(Button, { props: { label: 'Click Me' } });
    expect(getByText('Click Me')).toBeInTheDocument();
  });

  it('should call the click handler when clicked', async () => {
    const handleClick = vi.fn();
    const { getByText } = render(Button, { 
      props: { 
        label: 'Click Me',
        onClick: handleClick
      } 
    });
    
    await fireEvent.click(getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when the disabled prop is true', () => {
    const { getByText } = render(Button, { 
      props: { 
        label: 'Click Me',
        disabled: true
      } 
    });
    
    expect(getByText('Click Me').closest('button')).toBeDisabled();
  });
});
```

### Unit Test Example (Backend Service)

```javascript
// auth-service.test.js
const bcrypt = require('bcrypt');
const authService = require('../../src/services/auth-service');
const userModel = require('../../src/models/user-model');

// Mock dependencies
jest.mock('../../src/models/user-model');
jest.mock('bcrypt');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should hash password and create user', async () => {
      // Setup
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const hashedPassword = 'hashed_password';
      bcrypt.hash.mockResolvedValue(hashedPassword);
      
      const createdUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };
      userModel.createUser.mockResolvedValue(createdUser);
      
      // Execute
      const result = await authService.registerUser(userData);
      
      // Verify
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userModel.createUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: hashedPassword
      });
      expect(result).toEqual(createdUser);
    });
  });
  
  // More tests...
});
```

### Integration Test Example (API Endpoint)

```javascript
// auth-routes.test.js
const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth-routes');
const authController = require('../../src/controllers/auth-controller');

// Mock dependencies
jest.mock('../../src/controllers/auth-controller');

describe('Auth Routes', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRoutes);
  });
  
  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and user data on successful login', async () => {
      // Setup
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      authController.login.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            user: mockUser
          }
        });
      });
      
      // Execute & Verify
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.user).toEqual(mockUser);
        });
        
      expect(authController.login).toHaveBeenCalled();
    });
    
    // More tests...
  });
});
```

### E2E Test Example (User Flow)

```javascript
// login-flow.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Login Flow', () => {
  test('should log in successfully with valid credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
    
    // Fill in credentials
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirection to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify dashboard shows the right username
    await expect(page.locator('.welcome-card h1')).toContainText('Welcome, testuser!');
  });
  
  test('should show error message with invalid credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
    
    // Fill in credentials
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toContainText('Invalid username or password');
    
    // Verify URL hasn't changed
    await expect(page).toHaveURL('/login');
  });
});
```

## Test Coverage

We aim for the following test coverage targets:

- **Unit Tests**: 80% line coverage
- **Integration Tests**: Key API endpoints and database operations
- **E2E Tests**: Critical user flows

Coverage reports are generated as part of the CI/CD pipeline.

## Continuous Integration

Tests are run automatically:

1. **Pre-commit**: Run linting and unit tests
2. **Pull Request**: Run all tests and generate coverage report
3. **Merge to Main**: Run all tests as part of deployment pipeline

## Mocking

- Use mocks for external dependencies
- Use test doubles (stubs, spies) for internal dependencies
- Create realistic test data that resembles production data

## Test Environment

- Tests run in a separate environment from development
- Tests use an in-memory SQLite database
- Environment variables are set specifically for testing

## Test Data Management

- Use factories or fixtures to generate test data
- Reset database between test runs
- Avoid dependencies between tests

## Debugging Tests

- Use `--watch` mode for continuous test execution during development
- Set `debug` flag to enable verbose logging
- Use browser developer tools for E2E test debugging

## Performance Testing

- Load tests for API endpoints (using k6)
- Performance benchmarks for critical game operations
- Optimize slow tests to keep the test suite fast

## Accessibility Testing

- Automated accessibility tests using axe
- Manual testing with screen readers
- Keyboard navigation tests

## Documentation

- Document testing approaches for complex components
- Include testing information in component documentation
- Update this document as testing practices evolve

## Responsibilities

- Developers are responsible for writing tests for their code
- Code reviewers should verify test coverage and quality
- The testing infrastructure is maintained by the development team