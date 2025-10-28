/**
 * Space Invaders X - A classic space shooter game
 */

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 300;
const BULLET_SPEED = 400;
const ENEMY_SPEED = 50;
const ENEMY_ROWS = 4;
const ENEMY_COLS = 8;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;
const ENEMY_SPACING = 10;

// Game state
let game;
let input;
let player;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let score = 0;
let gameOverState = false;
let enemyDirection = 1;
let enemyMoveTimer = 0;
let enemyShootTimer = 0;

/**
 * Player ship
 */
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 30;
    this.speed = PLAYER_SPEED;
    this.color = '#00eeff';
    this.shootCooldown = 0;
    this.shootDelay = 0.3;
  }

  update(dt) {
    // Movement
    const horizontal = input.getHorizontal();
    this.x += horizontal * this.speed * dt;

    // Keep in bounds
    this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));

    // Shooting
    this.shootCooldown -= dt;
    if ((input.isAction1() || input.isAction1Pressed()) && this.shootCooldown <= 0) {
      this.shoot();
      this.shootCooldown = this.shootDelay;
    }
  }

  shoot() {
    bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -1));
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;

    // Better ASCII-style player ship
    //    ▲
    //   ███
    //  █████
    // ███████

    // Top point
    ctx.fillRect(this.x + 18, this.y, 4, 4);

    // Second row
    ctx.fillRect(this.x + 14, this.y + 5, 12, 4);

    // Third row
    ctx.fillRect(this.x + 10, this.y + 10, 20, 5);

    // Base (widest)
    ctx.fillRect(this.x + 6, this.y + 16, 28, 6);

    // Engine glow
    ctx.fillRect(this.x + 8, this.y + 22, 6, 4);
    ctx.fillRect(this.x + 26, this.y + 22, 6, 4);

    ctx.shadowBlur = 0;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

/**
 * Bullet
 */
class Bullet {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.width = 4;
    this.height = 12;
    this.speed = BULLET_SPEED;
    this.direction = direction; // -1 for up, 1 for down
    this.color = direction < 0 ? '#00eeff' : '#ff5252';
    this.destroyed = false;
  }

  update(dt) {
    this.y += this.direction * this.speed * dt;

    // Remove if out of bounds
    if (this.y < -this.height || this.y > CANVAS_HEIGHT) {
      this.destroyed = true;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

/**
 * Enemy
 */
class Enemy {
  constructor(x, y, type = 0) {
    this.x = x;
    this.y = y;
    this.width = ENEMY_WIDTH;
    this.height = ENEMY_HEIGHT;
    this.type = type;
    this.destroyed = false;
    this.colors = ['#8c52ff', '#ff5252', '#ffaa00'];
    this.points = [10, 20, 30];
  }

  update(dt) {
    // Movement is handled by the group
  }

  render(ctx) {
    const color = this.colors[this.type];
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // Different ASCII alien designs per type
    if (this.type === 0) {
      // Octopus - Type 1 (purple)
      //  ▄███▄
      // ███████
      // █ █ █ █
      ctx.fillRect(this.x + 5, this.y, 30, 8);
      ctx.fillRect(this.x, this.y + 8, 40, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + 8, this.y + 10, 4, 4);
      ctx.fillRect(this.x + 28, this.y + 10, 4, 4);
      ctx.fillStyle = color;
      // Tentacles
      ctx.fillRect(this.x + 4, this.y + 18, 5, 8);
      ctx.fillRect(this.x + 14, this.y + 18, 5, 8);
      ctx.fillRect(this.x + 24, this.y + 18, 5, 8);
      ctx.fillRect(this.x + 34, this.y + 18, 5, 8);
    } else if (this.type === 1) {
      // Crab - Type 2 (red)
      // █  ▄▄  █
      //  ██████
      // ████████
      ctx.fillRect(this.x, this.y, 6, 6);
      ctx.fillRect(this.x + 34, this.y, 6, 6);
      ctx.fillRect(this.x + 15, this.y, 10, 4);
      ctx.fillRect(this.x + 6, this.y + 6, 28, 8);
      ctx.fillRect(this.x, this.y + 14, 40, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + 10, this.y + 8, 5, 4);
      ctx.fillRect(this.x + 25, this.y + 8, 5, 4);
      ctx.fillStyle = color;
      // Legs
      ctx.fillRect(this.x + 2, this.y + 22, 4, 6);
      ctx.fillRect(this.x + 34, this.y + 22, 4, 6);
    } else {
      // Squid - Type 3 (yellow)
      //   ████
      //  ██████
      // ▀██████▀
      ctx.fillRect(this.x + 10, this.y, 20, 6);
      ctx.fillRect(this.x + 6, this.y + 6, 28, 8);
      ctx.fillRect(this.x + 4, this.y + 14, 32, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + 12, this.y + 8, 5, 4);
      ctx.fillRect(this.x + 23, this.y + 8, 5, 4);
      ctx.fillStyle = color;
      // Wavy bottom
      ctx.fillRect(this.x + 8, this.y + 22, 6, 4);
      ctx.fillRect(this.x + 20, this.y + 22, 6, 4);
      ctx.fillRect(this.x + 32, this.y + 22, 4, 4);
    }

    ctx.shadowBlur = 0;
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  getPoints() {
    return this.points[this.type];
  }
}

/**
 * Create enemy grid
 */
function createEnemies() {
  enemies = [];
  const startX = 100;
  const startY = 50;

  for (let row = 0; row < ENEMY_ROWS; row++) {
    for (let col = 0; col < ENEMY_COLS; col++) {
      const x = startX + col * (ENEMY_WIDTH + ENEMY_SPACING);
      const y = startY + row * (ENEMY_HEIGHT + ENEMY_SPACING);
      const type = Math.floor(row / 2); // Different types per 2 rows
      enemies.push(new Enemy(x, y, type));
    }
  }
}

/**
 * Update enemies as a group
 */
function updateEnemies(dt) {
  if (enemies.length === 0) {
    // Win condition - create new wave
    setTimeout(() => {
      createEnemies();
      enemyDirection = 1;
    }, 2000);
    return;
  }

  // Move enemies
  enemyMoveTimer += dt;
  if (enemyMoveTimer >= 0.5) {
    enemyMoveTimer = 0;

    // Check if we need to move down and reverse
    let shouldMoveDown = false;
    for (let enemy of enemies) {
      if ((enemy.x <= 0 && enemyDirection < 0) ||
          (enemy.x >= CANVAS_WIDTH - ENEMY_WIDTH && enemyDirection > 0)) {
        shouldMoveDown = true;
        break;
      }
    }

    if (shouldMoveDown) {
      enemyDirection *= -1;
      for (let enemy of enemies) {
        enemy.y += 20;
      }
    }

    // Move enemies horizontally
    for (let enemy of enemies) {
      enemy.x += enemyDirection * ENEMY_SPEED;
    }
  }

  // Enemy shooting
  enemyShootTimer += dt;
  if (enemyShootTimer >= 1.0 && enemies.length > 0) {
    enemyShootTimer = 0;
    const shooter = enemies[Math.floor(Math.random() * enemies.length)];
    enemyBullets.push(new Bullet(shooter.x + shooter.width / 2 - 2, shooter.y + shooter.height, 1));
  }

  // Check if enemies reached player
  for (let enemy of enemies) {
    if (enemy.y + enemy.height >= player.y) {
      endGame();
      return;
    }
  }
}

/**
 * Check collisions
 */
function checkCollisions() {
  // Player bullets vs enemies
  for (let bullet of bullets) {
    if (bullet.destroyed) continue;

    for (let enemy of enemies) {
      if (enemy.destroyed) continue;

      if (Collision.rectRect(bullet.getBounds(), enemy.getBounds())) {
        bullet.destroyed = true;
        enemy.destroyed = true;
        score += enemy.getPoints();
        gameAPI.updateScore(score);
        break;
      }
    }
  }

  // Enemy bullets vs player
  for (let bullet of enemyBullets) {
    if (bullet.destroyed) continue;

    if (Collision.rectRect(bullet.getBounds(), player.getBounds())) {
      bullet.destroyed = true;
      endGame();
      return;
    }
  }

  // Clean up destroyed entities
  bullets = bullets.filter(b => !b.destroyed);
  enemies = enemies.filter(e => !e.destroyed);
  enemyBullets = enemyBullets.filter(b => !b.destroyed);
}

/**
 * End the game
 */
function endGame() {
  if (gameOverState) return;

  gameOverState = true;
  game.pause();

  // Show game over screen
  document.getElementById('finalScoreText').textContent = `Score: ${score}`;
  document.getElementById('gameOver').style.display = 'block';

  // Notify parent
  gameAPI.gameOver(score);
}

/**
 * Initialize the game
 */
function init() {
  // Setup canvas
  const canvas = document.getElementById('gameCanvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Create game engine
  game = new GameEngine('gameCanvas', {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: '#000000'
  });

  // Create input handler
  input = new InputHandler();

  // Create player
  player = new Player(CANVAS_WIDTH / 2 - 20, CANVAS_HEIGHT - 60);

  // Create enemies
  createEnemies();

  // Override game update
  game.update = function(dt) {
    if (gameOverState) return;

    input.update();

    player.update(dt);
    updateEnemies(dt);

    bullets.forEach(b => b.update(dt));
    enemyBullets.forEach(b => b.update(dt));

    checkCollisions();
  };

  // Override game render
  game.render = function() {
    game.clear();

    // Draw stars background
    drawStars();

    // Draw score
    game.drawText(`SCORE: ${score}`, 10, 10, {
      font: '12px "Press Start 2P"',
      color: '#ffffff'
    });

    // Draw game objects
    player.render(game.ctx);
    bullets.forEach(b => b.render(game.ctx));
    enemies.forEach(e => e.render(game.ctx));
    enemyBullets.forEach(b => b.render(game.ctx));
  };

  // Setup game API callbacks
  gameAPI.onPause(() => {
    game.pause();
  });

  gameAPI.onResume(() => {
    if (!gameOverState) {
      game.resume();
    }
  });

  // Listen for ESC to return to menu
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && gameOverState) {
      gameAPI.requestPause();
    }
  });

  // Notify parent that game is ready
  gameAPI.ready();

  // Start game
  game.start();
}

/**
 * Draw star field background
 */
let stars = [];
function drawStars() {
  // Initialize stars if needed
  if (stars.length === 0) {
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2,
        brightness: Math.random()
      });
    }
  }

  // Draw stars
  for (let star of stars) {
    const alpha = 0.3 + star.brightness * 0.7;
    game.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    game.ctx.fillRect(star.x, star.y, star.size, star.size);
  }
}

// Start the game when page loads
window.addEventListener('load', init);
