<script>
  import { Link } from 'svelte-navigator'
  import { isAuthenticated } from '../stores/user-store'
</script>

<div class="home-page">
  <section class="hero wave-bg">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">Dive Into the Ocean of Mathematical Puzzles</h1>
        <p class="hero-subtitle">
          Challenge your mind with classic strategy games in a soothing ocean-themed environment
        </p>
        <div class="hero-cta">
          {#if $isAuthenticated}
            <Link to="/games" class="btn btn-primary">Start Playing</Link>
          {:else}
            <Link to="/register" class="btn btn-primary">Sign Up Free</Link>
            <Link to="/login" class="btn btn-secondary">Login</Link>
          {/if}
        </div>
      </div>
    </div>
  </section>
  
  <section class="features">
    <div class="container">
      <h2 class="section-title">Explore Our Puzzle Ocean</h2>
      <div class="feature-cards">
        <div class="card feature-card">
          <div class="feature-icon">🏆</div>
          <h3 class="card-title">Challenge Friends</h3>
          <p class="card-body">
            Invite friends for 1v1 matches and test your strategic thinking against real opponents.
          </p>
        </div>
        
        <div class="card feature-card">
          <div class="feature-icon">🐬</div>
          <h3 class="card-title">AI Opponents</h3>
          <p class="card-body">
            Practice against intelligent AI with multiple difficulty levels, from gentle waves to stormy seas.
          </p>
        </div>
        
        <div class="card feature-card">
          <div class="feature-icon">🎮</div>
          <h3 class="card-title">Multiple Games</h3>
          <p class="card-body">
            Explore classic mathematical puzzles including Nim, Domineering, and Dots & Boxes.
          </p>
        </div>
      </div>
    </div>
  </section>
  
  <section class="game-showcase">
    <div class="container">
      <h2 class="section-title">Our Mathematical Games</h2>
      
      <div class="game-list">
        <div class="game-item">
          <div class="game-image nim"></div>
          <div class="game-details">
            <h3>Nim</h3>
            <p>A mathematical strategy game where players take turns removing objects from piles. The player who takes the last object wins.</p>
            <Link to="/games/nim" class="btn btn-secondary">Play Nim</Link>
          </div>
        </div>
        
        <div class="game-item reverse">
          <div class="game-image domineering"></div>
          <div class="game-details">
            <h3>Domineering</h3>
            <p>A strategic game played on a grid where players take turns placing dominoes. One player places horizontally, the other vertically.</p>
            <Link to="/games/domineering" class="btn btn-secondary">Play Domineering</Link>
          </div>
        </div>
        
        <div class="game-item">
          <div class="game-image dots-and-boxes"></div>
          <div class="game-details">
            <h3>Dots and Boxes</h3>
            <p>Connect adjacent dots to form boxes and score points. The player with the most boxes at the end wins.</p>
            <Link to="/games/dots-and-boxes" class="btn btn-secondary">Play Dots and Boxes</Link>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <section class="cta-section wave-bg">
    <div class="container">
      <h2>Ready to dive in?</h2>
      <p>Start your journey into the ocean of mathematical puzzles today.</p>
      <div class="cta-buttons">
        {#if $isAuthenticated}
          <Link to="/games" class="btn btn-primary">Play Now</Link>
        {:else}
          <Link to="/register" class="btn btn-primary">Create Account</Link>
          <Link to="/login" class="btn btn-secondary">Login</Link>
        {/if}
      </div>
    </div>
  </section>
</div>

<style lang="scss">
  .home-page {
    .hero {
      padding: var(--space-xl) 0;
      background-color: var(--ocean-bg-alt);
      text-align: center;
      
      .hero-content {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--space-xl) 0;
      }
      
      .hero-title {
        font-size: calc(var(--text-3xl) * 1.2);
        color: var(--ocean-dark);
        margin-bottom: var(--space-lg);
      }
      
      .hero-subtitle {
        font-size: var(--text-xl);
        color: var(--ocean-deep);
        margin-bottom: var(--space-xl);
      }
      
      .hero-cta {
        display: flex;
        justify-content: center;
        gap: var(--space-md);
        
        .btn {
          padding: var(--space-md) var(--space-xl);
          font-size: var(--text-lg);
        }
      }
    }
    
    .section-title {
      text-align: center;
      margin-bottom: var(--space-xl);
      color: var(--ocean-dark);
      font-size: var(--text-2xl);
    }
    
    .features {
      padding: var(--space-xl) 0;
      
      .feature-cards {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-lg);
        justify-content: center;
      }
      
      .feature-card {
        flex: 1;
        min-width: 250px;
        max-width: 350px;
        text-align: center;
        padding: var(--space-lg);
        
        .feature-icon {
          font-size: 3rem;
          margin-bottom: var(--space-md);
        }
      }
    }
    
    .game-showcase {
      padding: var(--space-xl) 0;
      background-color: white;
      
      .game-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xl);
      }
      
      .game-item {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-lg);
        
        &.reverse {
          flex-direction: row-reverse;
        }
        
        .game-image {
          flex: 1;
          min-width: 300px;
          height: 250px;
          border-radius: var(--border-radius-lg);
          background-size: cover;
          background-position: center;
          box-shadow: var(--shadow-md);
          
          &.nim {
            background-image: linear-gradient(rgba(10, 61, 98, 0.3), rgba(10, 61, 98, 0.3)), 
                              url('https://source.unsplash.com/800x600/?pebbles,stones');
          }
          
          &.domineering {
            background-image: linear-gradient(rgba(10, 61, 98, 0.3), rgba(10, 61, 98, 0.3)), 
                              url('https://source.unsplash.com/800x600/?grid,pattern');
          }
          
          &.dots-and-boxes {
            background-image: linear-gradient(rgba(10, 61, 98, 0.3), rgba(10, 61, 98, 0.3)), 
                              url('https://source.unsplash.com/800x600/?dots,lines');
          }
        }
        
        .game-details {
          flex: 1;
          min-width: 300px;
          
          h3 {
            font-size: var(--text-xl);
            margin-bottom: var(--space-md);
            color: var(--ocean-dark);
          }
          
          p {
            margin-bottom: var(--space-lg);
            color: var(--ocean-text);
            line-height: 1.6;
          }
        }
      }
    }
    
    .cta-section {
      text-align: center;
      padding: var(--space-xl) 0;
      background-color: var(--ocean-bg-alt);
      
      h2 {
        font-size: var(--text-2xl);
        margin-bottom: var(--space-md);
        color: var(--ocean-dark);
      }
      
      p {
        font-size: var(--text-lg);
        margin-bottom: var(--space-lg);
        color: var(--ocean-deep);
      }
      
      .cta-buttons {
        display: flex;
        justify-content: center;
        gap: var(--space-md);
      }
    }
    
    @media (max-width: 768px) {
      .hero {
        .hero-title {
          font-size: var(--text-3xl);
        }
        
        .hero-subtitle {
          font-size: var(--text-lg);
        }
        
        .hero-cta {
          flex-direction: column;
          align-items: center;
          
          .btn {
            width: 100%;
            max-width: 300px;
          }
        }
      }
      
      .game-item, .game-item.reverse {
        flex-direction: column;
        
        .game-image {
          width: 100%;
        }
      }
      
      .cta-section {
        .cta-buttons {
          flex-direction: column;
          align-items: center;
          
          .btn {
            width: 100%;
            max-width: 300px;
          }
        }
      }
    }
  }
</style>