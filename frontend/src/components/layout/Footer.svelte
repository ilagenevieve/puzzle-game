<script>
  import { Link } from 'svelte-navigator'
  
  const currentYear = new Date().getFullYear()
</script>

<footer class="footer wave-bg">
  <div class="container">
    <div class="footer-content">
      <div class="footer-logo">
        <span class="logo-icon">🌊</span>
        <span class="logo-text">Ocean of Puzzles</span>
      </div>
      
      <div class="footer-links">
        <div class="link-group">
          <h4>Play</h4>
          <ul>
            <li><Link to="/games/nim">Nim</Link></li>
            <li><Link to="/games/domineering">Domineering</Link></li>
            <li><Link to="/games/dots-and-boxes">Dots and Boxes</Link></li>
          </ul>
        </div>
        
        <div class="link-group">
          <h4>About</h4>
          <ul>
            <li><Link to="/about">About The Game</Link></li>
            <li><Link to="/tutorial">How To Play</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div class="link-group">
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/profile">My Profile</Link></li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; {currentYear} Ocean of Puzzles. All rights reserved.</p>
      <p class="footer-note">Dive into the world of mathematical puzzles.</p>
    </div>
  </div>
</footer>

<style lang="scss">
  .footer {
    background-color: var(--ocean-dark);
    color: white;
    padding: var(--space-xl) 0 var(--space-lg);
    margin-top: var(--space-xl);
    position: relative;
    
    .footer-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-bottom: var(--space-xl);
    }
    
    .footer-logo {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: var(--text-xl);
      margin-bottom: var(--space-lg);
      
      .logo-icon {
        font-size: 1.5em;
        margin-right: var(--space-sm);
      }
    }
    
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xl);
      
      .link-group {
        min-width: 150px;
        
        h4 {
          color: white;
          margin-bottom: var(--space-md);
          font-size: var(--text-lg);
        }
        
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          
          li {
            margin-bottom: var(--space-sm);
            
            a {
              color: var(--ocean-secondary);
              text-decoration: none;
              transition: color var(--transition-fast);
              
              &:hover {
                color: white;
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
    
    .footer-bottom {
      padding-top: var(--space-lg);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      
      p {
        margin-bottom: var(--space-sm);
      }
      
      .footer-note {
        color: var(--ocean-secondary);
        font-size: var(--text-sm);
      }
    }
    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
      }
      
      .footer-links {
        width: 100%;
      }
    }
    
    @media (max-width: 480px) {
      .footer-links {
        flex-direction: column;
        gap: var(--space-lg);
      }
    }
  }
</style>