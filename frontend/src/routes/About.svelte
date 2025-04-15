<script>
  // About page component
</script>

<section class="about-page">
  <div class="about-header">
    <h1>About Ocean of Puzzles</h1>
    <p class="subtitle">A dive into mathematical strategy games</p>
  </div>
  
  <div class="about-content">
    <div class="about-section">
      <h2>Our Mission</h2>
      <p>Ocean of Puzzles aims to make classic mathematical strategy games accessible to everyone. We believe that these timeless puzzles offer more than just entertainment—they develop critical thinking, pattern recognition, and strategic planning skills.</p>
      <p>Each game in our collection has been carefully designed to be engaging for both newcomers and experienced players, with intuitive controls and helpful tutorials to guide you along the way.</p>
    </div>
    
    <div class="about-section">
      <h2>Our Games</h2>
      <div class="games-grid">
        <div class="game-card">
          <div class="game-icon">🧩</div>
          <h3>Nim</h3>
          <p>A mathematical strategy game where players take turns removing objects from distinct heaps. On each turn, a player must remove at least one object, and may remove any number of objects provided they all come from the same heap.</p>
        </div>
        
        <div class="game-card">
          <div class="game-icon">📏</div>
          <h3>Domineering</h3>
          <p>A territorial abstract strategy game played on a rectangular grid. Two players take turns placing dominoes on the board, with one player placing them vertically and the other horizontally.</p>
        </div>
        
        <div class="game-card">
          <div class="game-icon">📦</div>
          <h3>Dots and Boxes</h3>
          <p>A classic pen-and-paper game where two players take turns connecting dots on a grid. When a player completes a box, they earn a point and take another turn. Strategy evolves as the board fills up!</p>
        </div>
      </div>
    </div>
    
    <div class="about-section">
      <h2>Behind the Magic</h2>
      <p>Ocean of Puzzles was developed using modern web technologies to ensure a smooth experience across all devices:</p>
      <ul class="tech-list">
        <li><span class="tech-name">Svelte</span> - A reactive JavaScript framework for building user interfaces</li>
        <li><span class="tech-name">Phaser</span> - A powerful game engine for creating engaging interactive experiences</li>
        <li><span class="tech-name">Node.js</span> - Server-side JavaScript for our API and game logic</li>
        <li><span class="tech-name">Socket.io</span> - Real-time communication for multiplayer functionality</li>
      </ul>
    </div>
    
    <div class="about-section">
      <h2>Get in Touch</h2>
      <p>Have suggestions, feedback, or just want to say hello? We'd love to hear from you!</p>
      <div class="contact-buttons">
        <a href="mailto:contact@oceanofpuzzles.com" class="contact-button email">
          <span class="icon">✉️</span>
          <span>Email Us</span>
        </a>
        <a href="https://twitter.com/oceanofpuzzles" target="_blank" rel="noopener noreferrer" class="contact-button twitter">
          <span class="icon">🐦</span>
          <span>Twitter</span>
        </a>
        <a href="https://github.com/oceanofpuzzles" target="_blank" rel="noopener noreferrer" class="contact-button github">
          <span class="icon">💻</span>
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  .about-page {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .about-header {
    text-align: center;
    padding: 2rem 0;
    margin-bottom: 2rem;
    
    h1 {
      color: var(--ocean-primary);
      margin-bottom: 0.5rem;
      font-size: 2.2rem;
    }
    
    .subtitle {
      color: var(--ocean-text-light);
      font-size: 1.2rem;
      font-style: italic;
    }
  }
  
  .about-content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  .about-section {
    margin-bottom: 3rem;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h2 {
      color: var(--ocean-secondary);
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--ocean-accent-light);
    }
    
    p {
      line-height: 1.6;
      margin-bottom: 1rem;
      color: var(--ocean-text);
    }
  }
  
  .games-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
    
    @media (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .game-card {
    background-color: var(--ocean-bg-light);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    
    .game-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: var(--ocean-primary);
    }
    
    h3 {
      margin: 0 0 1rem 0;
      color: var(--ocean-text);
    }
    
    p {
      font-size: 0.9rem;
      text-align: left;
      margin: 0;
    }
  }
  
  .tech-list {
    list-style: none;
    padding: 0;
    
    li {
      margin-bottom: 0.5rem;
      padding-left: 1.5rem;
      position: relative;
      
      &::before {
        content: '🔹';
        position: absolute;
        left: 0;
        color: var(--ocean-primary);
      }
    }
    
    .tech-name {
      font-weight: bold;
      color: var(--ocean-secondary);
    }
  }
  
  .contact-buttons {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
    
    @media (min-width: 576px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .contact-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.2rem;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .icon {
      font-size: 1.8rem;
      margin-bottom: 0.8rem;
    }
    
    span:not(.icon) {
      font-weight: 500;
    }
    
    &.email {
      background-color: var(--ocean-primary);
      color: white;
    }
    
    &.twitter {
      background-color: #1DA1F2;
      color: white;
    }
    
    &.github {
      background-color: #24292e;
      color: white;
    }
  }
</style>