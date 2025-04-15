<script>
  import { Router, Route } from 'svelte-navigator'
  import { onMount } from 'svelte'
  import { userStore, toastStore } from './stores/user-store'
  import { getCurrentUser } from './services/api'
  
  // Components
  import Header from './components/layout/Header.svelte'
  import Footer from './components/layout/Footer.svelte'
  import Toast from './components/layout/Toast.svelte'
  import AuthGuard from './components/auth/AuthGuard.svelte'
  
  // Pages
  import Home from './routes/Home.svelte'
  import Login from './routes/Login.svelte'
  import Register from './routes/Register.svelte'
  import About from './routes/About.svelte'
  import NotFound from './routes/NotFound.svelte'
  import GameDemo from './routes/GameDemo.svelte'
  
  // Protected Pages
  import Dashboard from './routes/Dashboard.svelte'
  import Profile from './routes/Profile.svelte'
  import GameLobby from './routes/GameLobby.svelte'
  
  let isLoading = true
  
  onMount(async () => {
    try {
      // Mock user session for demo without a backend
      if (window.location.hostname === 'localhost') {
        setTimeout(() => {
          isLoading = false
        }, 1000)
        return
      }
      
      const userData = await getCurrentUser()
      if (userData && userData.data && userData.data.user) {
        userStore.setUser(userData.data.user)
        toastStore.show(`Welcome back, ${userData.data.user.username}!`, 'success')
      }
    } catch (error) {
      console.error('Failed to load user session:', error)
    } finally {
      isLoading = false
    }
  })
  
  // Function to check if user's browser supports localStorage
  function isLocalStorageAvailable() {
    try {
      const test = 'test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch(e) {
      return false
    }
  }
</script>

<main class="app-container ocean-theme">
  <!-- Toast notifications - visible in all routes -->
  <Toast position="top-right" />
  
  {#if isLoading}
    <div class="loading-screen">
      <div class="wave-loader">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
      <p>Loading Ocean of Puzzles...</p>
    </div>
  {:else}
    <Router>
      <Header />
      
      <div class="main-content">
        <!-- Public Routes -->
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/about" component={About} />
        <Route path="/game-demo" component={GameDemo} />
        
        <!-- Protected Routes -->
        <Route path="/dashboard">
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        </Route>
        
        <Route path="/profile">
          <AuthGuard>
            <Profile />
          </AuthGuard>
        </Route>
        
        <Route path="/games">
          <AuthGuard>
            <GameLobby />
          </AuthGuard>
        </Route>
        
        <!-- 404 Route -->
        <Route path="*" component={NotFound} />
      </div>
      
      <Footer />
    </Router>
  {/if}
</main>

<style lang="scss">
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--ocean-bg);
    color: var(--ocean-text);
  }
  
  .loading-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    
    p {
      margin-top: 2rem;
      font-size: 1.2rem;
      color: var(--ocean-primary);
    }
  }
  
  .main-content {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .wave-loader {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 50px;
    width: 100px;
    
    .wave {
      width: 8px;
      height: 40px;
      margin: 0 3px;
      background-color: var(--ocean-primary);
      border-radius: 10px;
      animation: wave 1s ease-in-out infinite;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
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