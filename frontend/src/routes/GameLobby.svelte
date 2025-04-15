<script>
  import { onMount } from 'svelte'
  import { getGameTypes, createGameInvitation } from '../services/api'
  
  let gameTypes = []
  let loading = true
  let error = null
  let selectedGameType = null
  
  // For invitations
  let invitationCode = null
  let generatingInvitation = false
  let invitationError = null
  
  onMount(async () => {
    try {
      const response = await getGameTypes()
      gameTypes = response.data.gameTypes
      if (gameTypes.length > 0) {
        selectedGameType = gameTypes[0].id
      }
    } catch (err) {
      error = err.message || 'Failed to load game types'
    } finally {
      loading = false
    }
  })
  
  async function createInvitation() {
    if (!selectedGameType) return
    
    try {
      generatingInvitation = true
      invitationError = null
      const response = await createGameInvitation(selectedGameType)
      invitationCode = response.data.invitation.code
    } catch (err) {
      invitationError = err.message || 'Failed to create invitation'
    } finally {
      generatingInvitation = false
    }
  }
  
  function startSinglePlayerGame() {
    // TODO: Implement navigation to game setup
    alert('Starting single player game of type: ' + selectedGameType)
  }
  
  function joinGameWithCode() {
    // TODO: Implement joining game with invitation code
    const code = prompt('Enter invitation code')
    if (code) {
      alert('Joining game with code: ' + code)
    }
  }
</script>

<section class="game-lobby">
  <h1>Game Lobby</h1>
  
  {#if loading}
    <div class="loading">Loading available games...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else if gameTypes.length === 0}
    <div class="no-games">No games are currently available. Please check back later.</div>
  {:else}
    <div class="lobby-container">
      <div class="game-selection">
        <h2>Available Games</h2>
        <div class="game-types">
          {#each gameTypes as gameType}
            <div 
              class="game-type-card {selectedGameType === gameType.id ? 'selected' : ''}"
              on:click={() => selectedGameType = gameType.id}
            >
              <div class="game-icon">{gameType.icon || '🎮'}</div>
              <h3>{gameType.name}</h3>
              <p>{gameType.description}</p>
            </div>
          {/each}
        </div>
      </div>
      
      <div class="game-actions">
        <h2>Start Playing</h2>
        <button class="action-button practice" on:click={startSinglePlayerGame}>
          <span class="icon">🤖</span>
          <span>Practice vs AI</span>
        </button>
        
        <div class="action-divider">
          <span>or</span>
        </div>
        
        <div class="multiplayer-section">
          <button 
            class="action-button create" 
            on:click={createInvitation}
            disabled={generatingInvitation || !selectedGameType}
          >
            <span class="icon">✉️</span>
            <span>{generatingInvitation ? 'Generating...' : 'Create Invitation'}</span>
          </button>
          
          <button class="action-button join" on:click={joinGameWithCode}>
            <span class="icon">🔍</span>
            <span>Join with Code</span>
          </button>
          
          {#if invitationCode}
            <div class="invitation-code">
              <label>Share this code with a friend:</label>
              <div class="code-display">
                <code>{invitationCode}</code>
                <button 
                  class="copy-button" 
                  on:click={() => navigator.clipboard.writeText(invitationCode)}
                >
                  Copy
                </button>
              </div>
            </div>
          {/if}
          
          {#if invitationError}
            <div class="invitation-error">{invitationError}</div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</section>

<style lang="scss">
  .game-lobby {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    
    h1 {
      margin-bottom: 1.5rem;
      color: var(--ocean-primary);
    }
  }
  
  .lobby-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    
    @media (min-width: 768px) {
      grid-template-columns: 3fr 2fr;
    }
  }
  
  .game-selection, .game-actions {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    
    h2 {
      margin-top: 0;
      color: var(--ocean-text);
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--ocean-accent-light);
      padding-bottom: 0.5rem;
    }
  }
  
  .game-types {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    
    @media (min-width: 480px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (min-width: 992px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .game-type-card {
    background-color: var(--ocean-bg-light);
    border-radius: 6px;
    padding: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    &.selected {
      border-color: var(--ocean-primary);
      background-color: rgba(var(--ocean-primary-rgb), 0.05);
    }
    
    .game-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: var(--ocean-primary);
    }
    
    h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      color: var(--ocean-text);
    }
    
    p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--ocean-text-light);
    }
  }
  
  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;
    margin-bottom: 1rem;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .icon {
      margin-right: 0.5rem;
      font-size: 1.2rem;
    }
    
    &.practice {
      background-color: var(--ocean-primary);
      color: white;
    }
    
    &.create {
      background-color: var(--ocean-secondary);
      color: white;
    }
    
    &.join {
      background-color: var(--ocean-accent);
      color: white;
    }
  }
  
  .action-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1.5rem 0;
    
    &::before, &::after {
      content: '';
      flex-grow: 1;
      height: 1px;
      background-color: var(--ocean-accent-light);
    }
    
    span {
      padding: 0 1rem;
      color: var(--ocean-text-light);
      font-size: 0.9rem;
    }
  }
  
  .invitation-code {
    margin-top: 1.5rem;
    background-color: var(--ocean-bg-light);
    border-radius: 6px;
    padding: 1rem;
    
    label {
      display: block;
      font-size: 0.9rem;
      color: var(--ocean-text-light);
      margin-bottom: 0.5rem;
    }
    
    .code-display {
      display: flex;
      align-items: center;
      background-color: white;
      border: 1px solid var(--ocean-accent-light);
      border-radius: 4px;
      overflow: hidden;
      
      code {
        flex-grow: 1;
        padding: 0.7rem;
        font-family: monospace;
        font-size: 1.1rem;
        color: var(--ocean-primary);
      }
      
      .copy-button {
        background-color: var(--ocean-secondary-light);
        border: none;
        color: var(--ocean-text);
        padding: 0.7rem 1rem;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: background-color 0.2s;
        
        &:hover {
          background-color: var(--ocean-secondary);
          color: white;
        }
      }
    }
  }
  
  .invitation-error {
    margin-top: 1rem;
    padding: 0.7rem;
    background-color: rgba(var(--ocean-error-rgb), 0.1);
    border-radius: 4px;
    color: var(--ocean-error);
    font-size: 0.9rem;
  }
  
  .loading, .error, .no-games {
    padding: 2rem;
    text-align: center;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .error {
    color: var(--ocean-error);
  }
</style>