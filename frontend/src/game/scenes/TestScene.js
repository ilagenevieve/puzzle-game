import BaseScene from './BaseScene';

/**
 * Test scene to verify Phaser integration works correctly
 */
export default class TestScene extends BaseScene {
  constructor() {
    super('TestScene');
    
    this.circles = [];
    this.bubbles = [];
  }

  preload() {
    super.preload();
    
    // Load test assets if needed
    // this.load.image('bubble', 'assets/bubble.png');
  }

  create() {
    super.create();
    
    // Add title text
    this.titleText = this.add.text(
      this.centerX,
      50,
      'Ocean of Puzzles',
      {
        fontFamily: 'Arial',
        fontSize: 32,
        color: '#ffffff',
        align: 'center',
      }
    ).setOrigin(0.5);
    
    // Add subtitle text
    this.subtitleText = this.add.text(
      this.centerX,
      100,
      'Phaser Integration Test',
      {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#88ccff',
        align: 'center',
      }
    ).setOrigin(0.5);
    
    // Create decorative circles
    this.createCircles();
    
    // Create interactive test button
    this.createTestButton();
    
    // Add ripple effect on click
    this.input.on('pointerdown', (pointer) => {
      this.createRipple(pointer.x, pointer.y);
    });
  }
  
  update() {
    // Animate the circles
    this.animateCircles();
    
    // Animate bubbles
    this.animateBubbles();
  }
  
  createCircles() {
    // Create some decorative background circles
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(0, this.width);
      const y = Phaser.Math.Between(0, this.height);
      const radius = Phaser.Math.Between(20, 80);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
      
      const circle = this.add.circle(x, y, radius, 0xffffff, alpha);
      circle.depth = -1;
      
      // Add some random velocity for animation
      circle.vx = Phaser.Math.FloatBetween(-0.2, 0.2);
      circle.vy = Phaser.Math.FloatBetween(-0.2, 0.2);
      
      this.circles.push(circle);
    }
  }
  
  animateCircles() {
    // Animate the background circles
    for (const circle of this.circles) {
      circle.x += circle.vx;
      circle.y += circle.vy;
      
      // Bounce off edges
      if (circle.x < 0 || circle.x > this.width) {
        circle.vx *= -1;
      }
      
      if (circle.y < 0 || circle.y > this.height) {
        circle.vy *= -1;
      }
    }
  }
  
  createTestButton() {
    // Create test button to generate bubbles
    this.button = this.createButton(
      this.centerX,
      this.centerY,
      'Create Bubbles',
      () => this.createBubbles(5),
      {
        width: 250,
        height: 60,
        fontSize: 20
      }
    );
  }
  
  createBubbles(count = 3) {
    for (let i = 0; i < count; i++) {
      // Random position at the bottom of the screen
      const x = Phaser.Math.Between(50, this.width - 50);
      const y = this.height + 20;
      
      // Create the bubble
      const radius = Phaser.Math.Between(15, 40);
      const bubble = this.add.circle(x, y, radius, 0x88ccff, 0.7);
      
      // Add stroke
      const strokeWidth = 2;
      const stroke = this.add.circle(x, y, radius + strokeWidth/2, 0xffffff, 0.3);
      stroke.setStrokeStyle(strokeWidth, 0xffffff, 0.8);
      
      // Add a highlight (small white circle)
      const highlight = this.add.circle(
        x - radius/3, 
        y - radius/3, 
        radius/4, 
        0xffffff, 
        0.8
      );
      
      // Group them together
      const container = this.add.container(0, 0, [stroke, bubble, highlight]);
      container.setDepth(1);
      
      // Set properties for animation
      container.x = x;
      container.y = y;
      container.radius = radius;
      container.speedY = Phaser.Math.FloatBetween(0.8, 2);
      container.wobbleSpeed = Phaser.Math.FloatBetween(0.01, 0.05);
      container.wobbleAmount = Phaser.Math.Between(10, 30);
      container.wobbleCurrent = 0;
      
      // Add to array
      this.bubbles.push(container);
    }
  }
  
  animateBubbles() {
    for (let i = 0; i < this.bubbles.length; i++) {
      const bubble = this.bubbles[i];
      
      // Move upward
      bubble.y -= bubble.speedY;
      
      // Add wobble effect
      bubble.wobbleCurrent += bubble.wobbleSpeed;
      bubble.x = bubble.x + Math.sin(bubble.wobbleCurrent) * 0.5;
      
      // Remove if it goes off-screen
      if (bubble.y < -50) {
        bubble.destroy();
        this.bubbles.splice(i, 1);
        i--;
      }
    }
  }
  
  createRipple(x, y) {
    // Create a ripple effect at the given position
    const ripple = this.add.circle(x, y, 10, 0xffffff, 0.5);
    
    // Animate the ripple growing and fading
    this.tweens.add({
      targets: ripple,
      radius: 100,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        ripple.setRadius(ripple.radius);
      },
      onComplete: () => {
        ripple.destroy();
      }
    });
  }
  
  updateLayout() {
    // Update positions based on new dimensions
    if (this.titleText) {
      this.titleText.setPosition(this.centerX, 50);
    }
    
    if (this.subtitleText) {
      this.subtitleText.setPosition(this.centerX, 100);
    }
    
    if (this.button) {
      this.button.setPosition(this.centerX, this.centerY);
    }
    
    // Update background
    if (this.bg) {
      this.bg.clear();
      this.bg.fillGradientStyle(
        0x1a4562,
        0x1a4562,
        0x2196f3,
        0x2196f3,
        1
      );
      this.bg.fillRect(0, 0, this.width, this.height);
    }
  }
}