/**
 * Sprite Manager - Handles sprite loading and animation
 */
class SpriteManager {
  constructor() {
    this.sprites = {};
    this.loadQueue = [];
    this.loadCallbacks = [];
  }

  /**
   * Load a sprite image
   * @param {string} name - Name to reference the sprite
   * @param {string} src - Image source URL or data URL
   * @returns {Promise}
   */
  loadSprite(name, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites[name] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Load multiple sprites
   * @param {Object} spriteMap - Map of {name: src}
   * @returns {Promise}
   */
  loadSprites(spriteMap) {
    const promises = Object.entries(spriteMap).map(([name, src]) =>
      this.loadSprite(name, src)
    );
    return Promise.all(promises);
  }

  /**
   * Get a loaded sprite
   * @param {string} name - Sprite name
   * @returns {Image}
   */
  getSprite(name) {
    return this.sprites[name];
  }

  /**
   * Draw a sprite
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} name - Sprite name
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width (optional)
   * @param {number} height - Height (optional)
   */
  drawSprite(ctx, name, x, y, width = null, height = null) {
    const sprite = this.sprites[name];
    if (!sprite) return;

    if (width && height) {
      ctx.drawImage(sprite, x, y, width, height);
    } else {
      ctx.drawImage(sprite, x, y);
    }
  }

  /**
   * Draw a sprite from a sprite sheet
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} name - Sprite sheet name
   * @param {number} sx - Source X
   * @param {number} sy - Source Y
   * @param {number} sWidth - Source width
   * @param {number} sHeight - Source height
   * @param {number} dx - Destination X
   * @param {number} dy - Destination Y
   * @param {number} dWidth - Destination width
   * @param {number} dHeight - Destination height
   */
  drawSpriteFrame(ctx, name, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    const sprite = this.sprites[name];
    if (!sprite) return;

    ctx.drawImage(sprite, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  /**
   * Create a simple animated sprite
   * @param {string} spriteName - The sprite sheet name
   * @param {Object} config - Animation config {frameWidth, frameHeight, frames, fps}
   * @returns {Object} Animation controller
   */
  createAnimation(spriteName, config) {
    const {
      frameWidth,
      frameHeight,
      frames = 1,
      fps = 10,
      loop = true
    } = config;

    return {
      currentFrame: 0,
      frameTime: 0,
      frameDuration: 1 / fps,
      playing: true,

      update(dt) {
        if (!this.playing) return;

        this.frameTime += dt;
        if (this.frameTime >= this.frameDuration) {
          this.frameTime = 0;
          this.currentFrame++;

          if (this.currentFrame >= frames) {
            if (loop) {
              this.currentFrame = 0;
            } else {
              this.currentFrame = frames - 1;
              this.playing = false;
            }
          }
        }
      },

      draw(ctx, spriteManager, x, y) {
        const sx = (this.currentFrame * frameWidth) % spriteManager.sprites[spriteName].width;
        const sy = Math.floor((this.currentFrame * frameWidth) / spriteManager.sprites[spriteName].width) * frameHeight;

        spriteManager.drawSpriteFrame(
          ctx,
          spriteName,
          sx, sy, frameWidth, frameHeight,
          x, y, frameWidth, frameHeight
        );
      },

      reset() {
        this.currentFrame = 0;
        this.frameTime = 0;
        this.playing = true;
      }
    };
  }
}

// Export for use in games
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpriteManager;
}
