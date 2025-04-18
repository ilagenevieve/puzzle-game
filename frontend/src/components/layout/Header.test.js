import { render, screen } from '@testing-library/svelte'
import Header from './Header.svelte'
import { userStore } from '../../stores/user-store'

// Mock the user store
vi.mock('../../stores/user-store', () => ({
  userStore: {
    subscribe: vi.fn((callback) => {
      callback({ isAuthenticated: false })
      return () => {}
    })
  }
}))

describe('Header component', () => {
  test('renders site title', () => {
    render(Header)
    expect(screen.getByText('Ocean of Puzzles')).toBeInTheDocument()
  })

  test('renders navigation links', () => {
    render(Header)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  test('shows login button when user is not authenticated', () => {
    render(Header)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  test('shows dashboard link when user is authenticated', () => {
    // Mock authenticated user
    vi.mocked(userStore.subscribe).mockImplementationOnce((callback) => {
      callback({ isAuthenticated: true })
      return () => {}
    })
    
    render(Header)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})