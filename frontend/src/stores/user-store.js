import { writable, derived } from 'svelte/store'

// Create a writable store with initial value
const createUserStore = () => {
  const { subscribe, set, update } = writable({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  })

  return {
    subscribe,
    // Set user data after successful authentication
    setUser: (userData) => {
      set({
        isAuthenticated: true,
        user: userData,
        loading: false,
        error: null,
      })
    },
    // Clear user data on logout
    clearUser: () => {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      })
    },
    // Set loading state during authentication requests
    setLoading: (isLoading) => {
      update(state => ({ ...state, loading: isLoading, error: null }))
    },
    // Set error state if authentication fails
    setError: (errorMessage) => {
      update(state => ({ ...state, loading: false, error: errorMessage }))
    },
  }
}

// Create the main user store
export const userStore = createUserStore()

// Derived store for user ID
export const userId = derived(
  userStore,
  $userStore => $userStore.user?.id || null
)

// Derived store for checking if user is authenticated
export const isAuthenticated = derived(
  userStore,
  $userStore => $userStore.isAuthenticated
)

// Derived store for checking if user is admin
export const isAdmin = derived(
  userStore,
  $userStore => $userStore.user?.is_admin || false
)

// Derived store for user display name or username fallback
export const displayName = derived(
  userStore,
  $userStore => $userStore.user?.display_name || $userStore.user?.username || 'Guest'
)