<script>
  import { navigate, Link, useLocation } from 'svelte-navigator'
  import { login } from '../services/api'
  import { userStore, isAuthenticated } from '../stores/user-store'
  import { onMount } from 'svelte'
  
  let username = ''
  let password = ''
  let loading = false
  let error = null
  let redirectPath = '/dashboard'
  
  // Get location to check for redirect information
  const location = useLocation()
  
  // Form validation state
  let submitted = false
  let usernameError = ''
  let passwordError = ''
  
  onMount(() => {
    // If user is already authenticated, redirect to dashboard
    if ($isAuthenticated) {
      navigate('/dashboard', { replace: true })
      return
    }
    
    // Check if we have a redirect path from a previous auth attempt
    if ($location.state && $location.state.from) {
      redirectPath = $location.state.from
    }
  })
  
  // Validate form fields
  function validateForm() {
    submitted = true
    let isValid = true
    
    // Validate username
    if (!username.trim()) {
      usernameError = 'Username is required'
      isValid = false
    } else {
      usernameError = ''
    }
    
    // Validate password
    if (!password) {
      passwordError = 'Password is required'
      isValid = false
    } else {
      passwordError = ''
    }
    
    return isValid
  }
  
  // Handle login form submission
  async function handleSubmit() {
    if (!validateForm()) return
    
    loading = true
    error = null
    userStore.setLoading(true)
    
    try {
      const response = await login(username, password)
      userStore.setUser(response.data.user)
      
      // Navigate to the redirect path or dashboard
      navigate(redirectPath, { replace: true })
    } catch (err) {
      error = err.message || 'Failed to login. Please check your credentials and try again.'
      userStore.setError(error)
    } finally {
      loading = false
      userStore.setLoading(false)
    }
  }
</script>

<div class="login-page">
  <div class="container">
    <div class="auth-container">
      <div class="auth-card card">
        <h1 class="card-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to continue your puzzle journey</p>
        
        {#if error}
          <div class="alert alert-error">
            {error}
          </div>
        {/if}
        
        {#if redirectPath && redirectPath !== '/dashboard' && redirectPath !== '/login'}
          <div class="alert alert-info">
            Please sign in to access the requested page
          </div>
        {/if}
        
        <form on:submit|preventDefault={handleSubmit} class="auth-form">
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              type="text"
              id="username"
              class="form-control"
              class:is-invalid={submitted && usernameError}
              bind:value={username}
              disabled={loading}
              placeholder="Enter your username"
              autocomplete="username"
            />
            {#if submitted && usernameError}
              <div class="invalid-feedback">{usernameError}</div>
            {/if}
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              class="form-control"
              class:is-invalid={submitted && passwordError}
              bind:value={password}
              disabled={loading}
              placeholder="Enter your password"
              autocomplete="current-password"
            />
            {#if submitted && passwordError}
              <div class="invalid-feedback">{passwordError}</div>
            {/if}
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>
      </div>
      
      <div class="auth-decoration">
        <div class="ocean-waves">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .login-page {
    padding: var(--space-xl) 0;
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .auth-container {
      display: flex;
      max-width: 900px;
      margin: 0 auto;
      box-shadow: var(--shadow-lg);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
    }
    
    .auth-card {
      flex: 1;
      padding: var(--space-xl);
      border-radius: 0;
      box-shadow: none;
      max-width: 500px;
      
      &:hover {
        transform: none;
        box-shadow: none;
      }
      
      .card-title {
        text-align: center;
        margin-bottom: var(--space-sm);
      }
    }
    
    .auth-subtitle {
      text-align: center;
      color: var(--ocean-deep);
      margin-bottom: var(--space-xl);
    }
    
    .auth-form {
      .form-group {
        margin-bottom: var(--space-lg);
      }
      
      .form-actions {
        margin-top: var(--space-xl);
      }
      
      .btn-block {
        width: 100%;
        padding: var(--space-md);
      }
    }
    
    .auth-footer {
      margin-top: var(--space-xl);
      text-align: center;
      
      a {
        color: var(--ocean-primary);
        font-weight: 500;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .auth-decoration {
      flex: 1;
      background-color: var(--ocean-deep);
      position: relative;
      overflow: hidden;
      display: none;
      
      @media (min-width: 768px) {
        display: block;
      }
      
      .ocean-waves {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        
        .wave {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 200px;
          background: var(--ocean-primary);
          opacity: 0.3;
          border-radius: 100% 100% 0 0;
          animation: wave 8s infinite ease-in-out;
          
          &:nth-child(2) {
            height: 160px;
            background: var(--ocean-secondary);
            animation-delay: 0.5s;
            opacity: 0.4;
          }
          
          &:nth-child(3) {
            height: 120px;
            background: var(--ocean-accent);
            animation-delay: 1s;
            opacity: 0.5;
          }
        }
      }
    }
    
    .alert {
      padding: var(--space-md);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--space-lg);
      
      &.alert-error {
        background-color: rgba(255, 126, 103, 0.1);
        border: 1px solid var(--ocean-coral);
        color: var(--ocean-coral);
      }
      
      &.alert-info {
        background-color: rgba(100, 181, 246, 0.1);
        border: 1px solid var(--ocean-primary);
        color: var(--ocean-primary);
      }
    }
    
    @keyframes wave {
      0%, 100% {
        transform: scale(1, 1);
      }
      50% {
        transform: scale(1.1, 1.2);
      }
    }
    
    @media (max-width: 768px) {
      .auth-container {
        flex-direction: column;
        max-width: 500px;
      }
      
      .auth-card {
        padding: var(--space-lg);
      }
    }
  }
</style>