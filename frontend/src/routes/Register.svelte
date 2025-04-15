<script>
  import { navigate, Link } from 'svelte-navigator'
  import { register } from '../services/api'
  import { userStore } from '../stores/user-store'
  
  let username = ''
  let email = ''
  let password = ''
  let confirmPassword = ''
  let loading = false
  let error = null
  
  // Form validation state
  let submitted = false
  let usernameError = ''
  let emailError = ''
  let passwordError = ''
  let confirmPasswordError = ''
  
  // Validate form fields
  function validateForm() {
    submitted = true
    let isValid = true
    
    // Validate username
    if (!username.trim()) {
      usernameError = 'Username is required'
      isValid = false
    } else if (username.length < 3) {
      usernameError = 'Username must be at least 3 characters'
      isValid = false
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameError = 'Username can only contain letters, numbers, and underscores'
      isValid = false
    } else {
      usernameError = ''
    }
    
    // Validate email
    if (!email.trim()) {
      emailError = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError = 'Please enter a valid email address'
      isValid = false
    } else {
      emailError = ''
    }
    
    // Validate password
    if (!password) {
      passwordError = 'Password is required'
      isValid = false
    } else if (password.length < 8) {
      passwordError = 'Password must be at least 8 characters'
      isValid = false
    } else {
      passwordError = ''
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      confirmPasswordError = 'Please confirm your password'
      isValid = false
    } else if (password !== confirmPassword) {
      confirmPasswordError = 'Passwords do not match'
      isValid = false
    } else {
      confirmPasswordError = ''
    }
    
    return isValid
  }
  
  // Handle registration form submission
  async function handleSubmit() {
    if (!validateForm()) return
    
    loading = true
    error = null
    userStore.setLoading(true)
    
    try {
      const userData = { username, email, password }
      const response = await register(userData)
      userStore.setUser(response.data.user)
      navigate('/dashboard')
    } catch (err) {
      error = err.message || 'Registration failed. Please try again.'
      userStore.setError(error)
    } finally {
      loading = false
      userStore.setLoading(false)
    }
  }
</script>

<div class="register-page">
  <div class="container">
    <div class="auth-container">
      <div class="auth-card card">
        <h1 class="card-title">Create Account</h1>
        <p class="auth-subtitle">Join the ocean of mathematical puzzles</p>
        
        {#if error}
          <div class="alert alert-error">
            {error}
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
              placeholder="Choose a username"
            />
            {#if submitted && usernameError}
              <div class="invalid-feedback">{usernameError}</div>
            {/if}
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              class="form-control"
              class:is-invalid={submitted && emailError}
              bind:value={email}
              disabled={loading}
              placeholder="Enter your email address"
            />
            {#if submitted && emailError}
              <div class="invalid-feedback">{emailError}</div>
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
              placeholder="Create a password"
            />
            {#if submitted && passwordError}
              <div class="invalid-feedback">{passwordError}</div>
            {/if}
          </div>
          
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              class="form-control"
              class:is-invalid={submitted && confirmPasswordError}
              bind:value={confirmPassword}
              disabled={loading}
              placeholder="Confirm your password"
            />
            {#if submitted && confirmPasswordError}
              <div class="invalid-feedback">{confirmPasswordError}</div>
            {/if}
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
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
  .register-page {
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