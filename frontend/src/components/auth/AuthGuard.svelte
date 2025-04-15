<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-navigator'
  import { isAuthenticated, userStore } from '../../stores/user-store'
  import { getCurrentUser } from '../../services/api'
  
  export let requiredAuth = true  // If true, requires authentication
  export let redirectTo = '/login'  // Where to redirect if authentication fails
  export let onAuthSuccess = null  // Optional callback when auth is successful
  export let protectedRole = null  // Optional role required to access this route
  
  // The content to render when authentication is successful
  let authSuccessful = !requiredAuth  // Start as true if auth not required
  let isLoading = true
  let errorMessage = null
  
  onMount(async () => {
    try {
      isLoading = true
      // Try to get current user
      const response = await getCurrentUser()
      
      if (response && response.data && response.data.user) {
        // User is authenticated
        const user = response.data.user
        userStore.setUser(user)
        
        // Check if the route requires a specific role
        if (protectedRole && !user.roles?.includes(protectedRole)) {
          errorMessage = `You need ${protectedRole} permissions to access this page`
          navigate('/dashboard', { replace: true })
          return
        }
        
        authSuccessful = true
        
        // Call success callback if provided
        if (onAuthSuccess && typeof onAuthSuccess === 'function') {
          onAuthSuccess(user)
        }
      } else if (requiredAuth) {
        // User is not authenticated but authentication is required
        navigate(redirectTo, { 
          replace: true,
          state: { from: window.location.pathname } 
        })
      } else {
        // Authentication not required, but user is not logged in
        authSuccessful = true
      }
    } catch (error) {
      errorMessage = error.message
      if (requiredAuth) {
        // Error getting user and authentication is required
        navigate(redirectTo, { 
          replace: true,
          state: { from: window.location.pathname }
        })
      } else {
        // Authentication not required, continue anyway
        authSuccessful = true
      }
    } finally {
      isLoading = false
    }
  })
</script>

{#if isLoading}
  <div class="authenticating">
    <div class="wave-loader">
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
    <p>Authenticating...</p>
  </div>
{:else if errorMessage}
  <div class="auth-error">
    <div class="error-icon">⚠️</div>
    <p>{errorMessage}</p>
    <button class="btn btn-secondary" on:click={() => navigate('/dashboard')}>
      Return to Dashboard
    </button>
  </div>
{:else if authSuccessful}
  <slot></slot>
{/if}

<style>
  .authenticating, .auth-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 2rem;
  }
  
  .auth-error {
    background-color: rgba(255, 126, 103, 0.1);
    border-radius: 8px;
    margin: 2rem auto;
    max-width: 500px;
    text-align: center;
  }
  
  .error-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .wave-loader {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 50px;
    width: 100px;
    margin-bottom: 1rem;
  }
  
  .wave {
    width: 8px;
    height: 40px;
    margin: 0 3px;
    background-color: var(--ocean-primary);
    border-radius: 10px;
    animation: wave 1s ease-in-out infinite;
  }
  
  .wave:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .wave:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes wave {
    0% {
      height: 10px;
    }
    50% {
      height: 40px;
    }
    100% {
      height: 10px;
    }
  }
  
  button {
    margin-top: 1rem;
  }
</style>