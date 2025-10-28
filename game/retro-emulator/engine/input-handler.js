/**
 * Input Handler - Manages keyboard, mouse, and touch input
 */
class InputHandler {
  constructor() {
    this.keys = {};
    this.keyPressed = {};
    this.keyReleased = {};
    this.mousePos = { x: 0, y: 0 };
    this.mouseDown = false;
    this.mousePressed = false;
    this.mouseReleased = false;
    this.touches = [];

    // Virtual controls state (for touch devices)
    this.virtualControls = {
      up: false,
      down: false,
      left: false,
      right: false,
      action1: false,
      action2: false
    };

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleParentMessage = this.handleParentMessage.bind(this);

    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    // Keyboard
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Mouse
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);

    // Touch
    window.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd);

    // Parent window messages (for virtual controls)
    window.addEventListener('message', this.handleParentMessage);
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('message', this.handleParentMessage);
  }

  /**
   * Reset frame-specific input states
   */
  update() {
    this.keyPressed = {};
    this.keyReleased = {};
    this.mousePressed = false;
    this.mouseReleased = false;
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(e) {
    if (!this.keys[e.code]) {
      this.keyPressed[e.code] = true;
    }
    this.keys[e.code] = true;

    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  }

  /**
   * Handle keyup events
   */
  handleKeyUp(e) {
    this.keyReleased[e.code] = true;
    this.keys[e.code] = false;
  }

  /**
   * Handle mouse move events
   */
  handleMouseMove(e) {
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;
  }

  /**
   * Handle mouse down events
   */
  handleMouseDown(e) {
    if (!this.mouseDown) {
      this.mousePressed = true;
    }
    this.mouseDown = true;
  }

  /**
   * Handle mouse up events
   */
  handleMouseUp(e) {
    this.mouseReleased = true;
    this.mouseDown = false;
  }

  /**
   * Handle touch start events
   */
  handleTouchStart(e) {
    e.preventDefault();
    this.touches = Array.from(e.touches);
  }

  /**
   * Handle touch move events
   */
  handleTouchMove(e) {
    e.preventDefault();
    this.touches = Array.from(e.touches);
  }

  /**
   * Handle touch end events
   */
  handleTouchEnd(e) {
    this.touches = Array.from(e.touches);
  }

  /**
   * Handle messages from parent window (virtual controls)
   */
  handleParentMessage(e) {
    const message = e.data;
    if (message.type === 'CONTROL_INPUT') {
      this.virtualControls[message.control] = message.pressed;
    }
  }

  /**
   * Check if a key is currently down
   * @param {string} keyCode - The key code to check
   * @returns {boolean}
   */
  isKeyDown(keyCode) {
    return this.keys[keyCode] || false;
  }

  /**
   * Check if a key was just pressed this frame
   * @param {string} keyCode - The key code to check
   * @returns {boolean}
   */
  isKeyPressed(keyCode) {
    return this.keyPressed[keyCode] || false;
  }

  /**
   * Check if a key was just released this frame
   * @param {string} keyCode - The key code to check
   * @returns {boolean}
   */
  isKeyReleased(keyCode) {
    return this.keyReleased[keyCode] || false;
  }

  /**
   * Get horizontal input (-1 to 1)
   * @returns {number}
   */
  getHorizontal() {
    let h = 0;
    if (this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA') || this.virtualControls.left) h -= 1;
    if (this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD') || this.virtualControls.right) h += 1;
    return h;
  }

  /**
   * Get vertical input (-1 to 1)
   * @returns {number}
   */
  getVertical() {
    let v = 0;
    if (this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW') || this.virtualControls.up) v -= 1;
    if (this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS') || this.virtualControls.down) v += 1;
    return v;
  }

  /**
   * Check if action button 1 is pressed (Space, Z, or virtual)
   * @returns {boolean}
   */
  isAction1() {
    return this.isKeyDown('Space') || this.isKeyDown('KeyZ') || this.virtualControls.action1;
  }

  /**
   * Check if action button 2 is pressed (X or virtual)
   * @returns {boolean}
   */
  isAction2() {
    return this.isKeyDown('KeyX') || this.virtualControls.action2;
  }

  /**
   * Check if action button 1 was just pressed
   * @returns {boolean}
   */
  isAction1Pressed() {
    return this.isKeyPressed('Space') || this.isKeyPressed('KeyZ');
  }

  /**
   * Check if action button 2 was just pressed
   * @returns {boolean}
   */
  isAction2Pressed() {
    return this.isKeyPressed('KeyX');
  }
}

// Export for use in games
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputHandler;
}
