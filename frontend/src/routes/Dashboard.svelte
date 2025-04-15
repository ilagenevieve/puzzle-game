<script>
  import { isAuthenticated, displayName } from '../stores/user-store'
  import { getUserStats } from '../services/api'
  import { onMount } from 'svelte'
  
  let stats = null
  let loading = true
  let error = null
  
  onMount(async () => {
    try {
      loading = true
      const response = await getUserStats()
      stats = response.data.stats
    } catch (err) {
      error = err.message || 'Failed to load statistics'
    } finally {
      loading = false
    }
  })
</script>

<section class="dashboard">
  <div class="welcome-card">
    <h1>Welcome, {$displayName}!</h1>
    <p>Your mathematical puzzle adventure awaits.</p>
  </div>
  
  <div class="dashboard-content">
    <div class="stats-card">
      <h2>Your Stats</h2>
      
      {#if loading}
        <div class="loading">Loading statistics...</div>
      {:else if error}
        <div class="error">{error}</div>
      {:else if stats}
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{stats.totalGames || 0}</span>
            <span class="stat-label">Games Played</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{stats.wins || 0}</span>
            <span class="stat-label">Wins</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{stats.winRate || '0%'}</span>
            <span class="stat-label">Win Rate</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{stats.rankingPosition || 'N/A'}</span>
            <span class="stat-label">Ranking</span>
          </div>
        </div>
      {:else}
        <p>No statistics available yet. Start playing games to build your stats!</p>
      {/if}
    </div>
    
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="action-buttons">
        <a href="/games" class="action-button play">
          <span class="icon">🎮</span>
          <span>Play Now</span>
        </a>
        <a href="/profile" class="action-button profile">
          <span class="icon">👤</span>
          <span>View Profile</span>
        </a>
        <a href="/games/history" class="action-button history">
          <span class="icon">📜</span>
          <span>Game History</span>
        </a>
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  .dashboard {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .welcome-card {
    background: linear-gradient(135deg, var(--ocean-secondary), var(--ocean-primary));
    color: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
    }
    
    p {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }
  }
  
  .dashboard-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    
    @media (min-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .stats-card, .quick-actions {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    h2 {
      margin-top: 0;
      color: var(--ocean-text);
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--ocean-accent-light);
      padding-bottom: 0.5rem;
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background-color: var(--ocean-bg-light);
    border-radius: 6px;
    
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--ocean-primary);
    }
    
    .stat-label {
      font-size: 0.9rem;
      color: var(--ocean-text-light);
      margin-top: 0.5rem;
    }
  }
  
  .action-buttons {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    
    @media (min-width: 480px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .action-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: var(--ocean-bg-light);
    border-radius: 6px;
    color: var(--ocean-text);
    text-decoration: none;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .icon {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }
    
    &.play {
      background-color: var(--ocean-primary);
      color: white;
    }
    
    &.profile {
      background-color: var(--ocean-secondary-light);
      color: var(--ocean-text);
    }
    
    &.history {
      background-color: var(--ocean-accent-light);
      color: var(--ocean-text);
    }
  }
  
  .loading, .error {
    padding: 1rem;
    text-align: center;
    background-color: var(--ocean-bg-light);
    border-radius: 6px;
  }
  
  .error {
    color: var(--ocean-error);
  }
</style>