<script>
  import { Link, useNavigate } from 'svelte-navigator'
  import { isAuthenticated, displayName } from '../../stores/user-store'
  import { logout } from '../../services/api'
  
  let isMenuOpen = false
  const navigate = useNavigate()
  
  // Toggle mobile menu
  function toggleMenu() {
    isMenuOpen = !isMenuOpen
  }
  
  // Close mobile menu when clicking outside
  function closeMenu() {
    isMenuOpen = false
  }
  
  // Handle logout
  async function handleLogout() {
    try {
      await logout()
      window.location.href = '/' // Force full page reload to clear all state
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
</script>

<header class="header">
  <div class="container">
    <div class="header-content">
      <div class="logo">
        <Link to="/">
          <span class="logo-icon">🌊</span>
          <span class="logo-text">Ocean of Puzzles</span>
        </Link>
      </div>
      
      <nav class:active={isMenuOpen} class="nav">
        <ul class="nav-list">
          <li class="nav-item">
            <Link to="/" on:click={closeMenu}>Home</Link>
          </li>
          {#if $isAuthenticated}
            <li class="nav-item">
              <Link to="/dashboard" on:click={closeMenu}>Dashboard</Link>
            </li>
            <li class="nav-item">
              <Link to="/games" on:click={closeMenu}>Play</Link>
            </li>
            <li class="nav-item">
              <Link to="/profile" on:click={closeMenu}>My Profile</Link>
            </li>
          {:else}
            <li class="nav-item">
              <Link to="/games" on:click={closeMenu}>Games</Link>
            </li>
          {/if}
          <li class="nav-item">
            <Link to="/about" on:click={closeMenu}>About</Link>
          </li>
        </ul>
      </nav>
      
      <div class="auth-buttons">
        {#if $isAuthenticated}
          <span class="user-greeting">Hello, {$displayName}</span>
          <button class="btn btn-secondary" on:click={handleLogout}>Logout</button>
        {:else}
          <Link to="/login" class="btn btn-secondary">Login</Link>
          <Link to="/register" class="btn btn-primary">Sign Up</Link>
        {/if}
      </div>
      
      <button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
    </div>
  </div>
</header>

<style lang="scss">
  .header {
    background-color: white;
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: 0;
    z-index: 100;
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-md) 0;
    }
    
    .logo {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: var(--text-lg);
      
      a {
        display: flex;
        align-items: center;
        color: var(--ocean-dark);
        text-decoration: none;
      }
      
      .logo-icon {
        font-size: 1.5em;
        margin-right: var(--space-sm);
      }
    }
    
    .nav {
      .nav-list {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .nav-item {
        margin: 0 var(--space-md);
        
        a {
          color: var(--ocean-dark);
          text-decoration: none;
          padding: var(--space-xs) 0;
          position: relative;
          
          &:hover, &:focus {
            color: var(--ocean-primary);
          }
          
          &:hover::after, &:focus::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: var(--ocean-primary);
            border-radius: 1px;
          }
        }
      }
    }
    
    .auth-buttons {
      display: flex;
      align-items: center;
      
      .user-greeting {
        margin-right: var(--space-md);
        font-weight: 500;
      }
      
      .btn {
        margin-left: var(--space-sm);
      }
    }
    
    .menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 30px;
      height: 21px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      
      .bar {
        height: 3px;
        width: 100%;
        background-color: var(--ocean-dark);
        border-radius: 3px;
        transition: all 0.3s ease;
      }
    }
    
    @media (max-width: 768px) {
      .header-content {
        flex-wrap: wrap;
      }
      
      .nav {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background-color: white;
        box-shadow: var(--shadow-md);
        padding: var(--space-md);
        transform: translateY(-100%);
        opacity: 0;
        transition: all 0.3s ease-in-out;
        visibility: hidden;
        
        &.active {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }
        
        .nav-list {
          flex-direction: column;
        }
        
        .nav-item {
          margin: var(--space-sm) 0;
          
          a {
            display: block;
            padding: var(--space-sm) 0;
          }
        }
      }
      
      .auth-buttons {
        margin-left: auto;
        
        .user-greeting {
          display: none;
        }
      }
      
      .menu-toggle {
        display: flex;
      }
    }
    
    @media (max-width: 480px) {
      .logo-text {
        display: none;
      }
      
      .auth-buttons {
        .btn {
          padding: var(--space-xs) var(--space-sm);
          font-size: var(--text-sm);
        }
      }
    }
  }
</style>