<script>
  import { Link } from 'svelte-navigator'
</script>

<div class="not-found-page">
  <div class="container">
    <div class="content">
      <div class="ocean-graphic">
        <div class="waves">
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
        <div class="submarine">🌊</div>
      </div>
      
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Oops! Looks like you've drifted into uncharted waters.</p>
      <p>The page you're looking for has been lost at sea.</p>
      
      <div class="actions">
        <Link to="/" class="btn btn-primary">Return to Shore</Link>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .not-found-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    text-align: center;
    
    .content {
      max-width: 600px;
      margin: 0 auto;
      padding: var(--space-xl) 0;
    }
    
    h1 {
      font-size: 8rem;
      color: var(--ocean-primary);
      margin-bottom: 0;
      line-height: 1;
    }
    
    h2 {
      font-size: var(--text-2xl);
      color: var(--ocean-deep);
      margin-bottom: var(--space-lg);
    }
    
    p {
      font-size: var(--text-lg);
      color: var(--ocean-text);
      margin-bottom: var(--space-sm);
    }
    
    .actions {
      margin-top: var(--space-xl);
    }
    
    .ocean-graphic {
      position: relative;
      height: 150px;
      margin-bottom: var(--space-lg);
      
      .waves {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        
        .wave {
          width: 50px;
          height: 50px;
          background-color: var(--ocean-primary);
          opacity: 0.7;
          margin: 0 10px;
          border-radius: 50% 50% 0 0;
          animation: wave 3s infinite ease-in-out;
          
          &:nth-child(2) {
            animation-delay: 0.3s;
            height: 70px;
            background-color: var(--ocean-secondary);
          }
          
          &:nth-child(3) {
            animation-delay: 0.6s;
            height: 60px;
            background-color: var(--ocean-accent);
          }
        }
      }
      
      .submarine {
        position: absolute;
        bottom: 35px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 4rem;
        animation: float 3s infinite ease-in-out;
        z-index: 2;
      }
    }
    
    @keyframes wave {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-20px);
      }
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateX(-50%) translateY(0);
      }
      50% {
        transform: translateX(-50%) translateY(-15px);
      }
    }
  }
</style>