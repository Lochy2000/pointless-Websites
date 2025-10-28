/**
 * Retro Game Engine - Core utilities for building retro games
 */
class GameEngine {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId) || document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Default options
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      backgroundColor: options.backgroundColor || '#000000',
      pixelArt: options.pixelArt !== false, // Default true
      ...options
    };

    // Setup canvas
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;

    if (this.options.pixelArt) {
      this.ctx.imageSmoothingEnabled = false;
    }

    // Game state
    this.running = false;
    this.paused = false;
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    this.fps = 60;
    this.frameInterval = 1000 / this.fps;

    // Game objects
    this.entities = [];
    this.layers = {
      background: [],
      game: [],
      foreground: [],
      ui: []
    };

    // Bind methods
    this.gameLoop = this.gameLoop.bind(this);
  }

  /**
   * Start the game loop
   */
  start() {
    this.running = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.running = false;
  }

  /**
   * Pause the game
   */
  pause() {
    this.paused = true;
  }

  /**
   * Resume the game
   */
  resume() {
    this.paused = false;
    this.lastFrameTime = performance.now();
  }

  /**
   * Main game loop
   * @param {number} currentTime - Current timestamp
   */
  gameLoop(currentTime) {
    if (!this.running) return;

    // Calculate delta time
    this.deltaTime = currentTime - this.lastFrameTime;

    // Update at fixed frame rate
    if (this.deltaTime >= this.frameInterval) {
      this.lastFrameTime = currentTime - (this.deltaTime % this.frameInterval);

      if (!this.paused) {
        this.update(this.deltaTime / 1000); // Convert to seconds
        this.render();
      }
    }

    requestAnimationFrame(this.gameLoop);
  }

  /**
   * Update game state (to be overridden)
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    // Update all entities
    this.entities = this.entities.filter(entity => {
      if (entity.update) {
        entity.update(dt);
      }
      return !entity.destroyed;
    });
  }

  /**
   * Render game (to be overridden)
   */
  render() {
    // Clear canvas
    this.clear();

    // Render layers in order
    this.renderLayer('background');
    this.renderLayer('game');
    this.renderLayer('foreground');
    this.renderLayer('ui');

    // Render all entities
    this.entities.forEach(entity => {
      if (entity.render) {
        entity.render(this.ctx);
      }
    });
  }

  /**
   * Render a specific layer
   * @param {string} layerName - The layer to render
   */
  renderLayer(layerName) {
    const layer = this.layers[layerName] || [];
    layer.forEach(item => {
      if (typeof item === 'function') {
        item(this.ctx);
      } else if (item.render) {
        item.render(this.ctx);
      }
    });
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Add an entity to the game
   * @param {Object} entity - The entity to add
   * @param {string} layer - Optional layer name
   */
  addEntity(entity, layer = 'game') {
    if (layer && this.layers[layer]) {
      this.layers[layer].push(entity);
    } else {
      this.entities.push(entity);
    }
  }

  /**
   * Remove an entity from the game
   * @param {Object} entity - The entity to remove
   */
  removeEntity(entity) {
    entity.destroyed = true;
  }

  /**
   * Draw text with retro styling
   * @param {string} text - The text to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - Text options
   */
  drawText(text, x, y, options = {}) {
    const {
      font = '16px "Press Start 2P"',
      color = '#ffffff',
      align = 'left',
      baseline = 'top',
      shadow = false
    } = options;

    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;

    if (shadow) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 10;
    }

    this.ctx.fillText(text, x, y);

    if (shadow) {
      this.ctx.shadowBlur = 0;
    }
  }

  /**
   * Draw a rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {string} color - Fill color
   */
  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Draw a circle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Radius
   * @param {string} color - Fill color
   */
  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

// Export for use in games
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}
