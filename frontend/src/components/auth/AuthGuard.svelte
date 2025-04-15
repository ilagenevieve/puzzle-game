<script>
  import { onMount } from 'svelte'
  import { navigate } from 'svelte-navigator'
  import { isAuthenticated, userStore } from '../../stores/user-store'
  import { getCurrentUser } from '../../services/api'
  
  export let requiredAuth = true  // If true, requires authentication
  export let redirectTo = '/login'  // Where to redirect if authentication fails
  export let onAuthSuccess = null  // Optional callback when auth is successful
  
  // The content to render when authentication is successful
  let authSuccessful = !requiredAuth  // Start as true if auth not required
  
  onMount(async () => {
    try {
      // Try to get current user
      const response = await getCurrentUser()
      
      if (response && response.data && response.data.user) {
        // User is authenticated
        userStore.setUser(response.data.user)
        authSuccessful = true
        
        // Call success callback if provided
        if (onAuthSuccess && typeof onAuthSuccess === 'function') {
          onAuthSuccess(response.data.user)
        }
      } else if (requiredAuth) {
        // User is not authenticated but authentication is required
        navigate(redirectTo, { replace: true })
      } else {
        // Authentication not required, but user is not logged in
        authSuccessful = true
      }
    } catch (error) {
      if (requiredAuth) {
        // Error getting user and authentication is required
        navigate(redirectTo, { replace: true })
      } else {
        // Authentication not required, continue anyway
        authSuccessful = true
      }
    }
  })
</script>

{#if authSuccessful}
  <slot></slot>
{:else}
  <div class="authenticating">
    <div class="wave-loader">
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
    <p>Authenticating...</p>
  </div>
{/if}

<style>
  .authenticating {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 2rem;
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
</style>