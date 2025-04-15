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

// Create toast notification store
export const createToastStore = () => {
  const { subscribe, update } = writable({
    messages: [],
    nextId: 1
  })

  return {
    subscribe,
    // Add a new toast message
    show: (message, type = 'info', duration = 5000) => {
      const id = Date.now()
      
      // Add new toast
      update(state => {
        const newMessages = [...state.messages, { id, message, type, duration }]
        return { ...state, messages: newMessages }
      })
      
      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          update(state => {
            const filteredMessages = state.messages.filter(m => m.id !== id)
            return { ...state, messages: filteredMessages }
          })
        }, duration)
      }
      
      return id
    },
    // Remove a specific toast by ID
    remove: (id) => {
      update(state => {
        const filteredMessages = state.messages.filter(m => m.id !== id)
        return { ...state, messages: filteredMessages }
      })
    },
    // Clear all toasts
    clear: () => {
      update(state => ({ ...state, messages: [] }))
    }
  }
}

// Create the main user store
export const userStore = createUserStore()

// Create the toast notification store
export const toastStore = createToastStore()

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