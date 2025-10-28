/**
 * Game API - Communication bridge between games and parent app
 * Include this in your game to enable features like score tracking and controls
 */
class GameAPI {
  constructor() {
    this.parentWindow = window.parent;
    this.isPaused = false;
    this.pauseCallback = null;
    this.resumeCallback = null;
    this.controlCallback = null;

    // Listen for messages from parent
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  /**
   * Handle messages from parent window
   * @param {MessageEvent} event
   */
  handleMessage(event) {
    const message = event.data;

    switch (message.type) {
      case 'PAUSE':
        this.isPaused = true;
        if (this.pauseCallback) {
          this.pauseCallback();
        }
        break;

      case 'RESUME':
        this.isPaused = false;
        if (this.resumeCallback) {
          this.resumeCallback();
        }
        break;

      case 'CONTROL_INPUT':
        if (this.controlCallback) {
          this.controlCallback(message.control, message.pressed);
        }
        break;
    }
  }

  /**
   * Notify parent that game is ready
   */
  ready() {
    this.sendMessage({ type: 'GAME_READY' });
  }

  /**
   * Update score in parent app
   * @param {number} score - Current score
   */
  updateScore(score) {
    this.sendMessage({
      type: 'SCORE_UPDATE',
      score: score
    });
  }

  /**
   * Notify parent that game is over
   * @param {number} finalScore - Final score
   */
  gameOver(finalScore) {
    this.sendMessage({
      type: 'GAME_OVER',
      score: finalScore
    });
  }

  /**
   * Request pause from parent
   */
  requestPause() {
    this.sendMessage({ type: 'REQUEST_PAUSE' });
  }

  /**
   * Save game state to parent
   * @param {Object} state - Game state object
   */
  saveState(state) {
    this.sendMessage({
      type: 'SAVE_STATE',
      state: state
    });
  }

  /**
   * Send a message to parent window
   * @param {Object} message - Message object
   */
  sendMessage(message) {
    this.parentWindow.postMessage(message, '*');
  }

  /**
   * Set callback for pause event
   * @param {Function} callback
   */
  onPause(callback) {
    this.pauseCallback = callback;
  }

  /**
   * Set callback for resume event
   * @param {Function} callback
   */
  onResume(callback) {
    this.resumeCallback = callback;
  }

  /**
   * Set callback for control input
   * @param {Function} callback - Receives (control, pressed)
   */
  onControl(callback) {
    this.controlCallback = callback;
  }
}

// Create global instance
const gameAPI = new GameAPI();

// Export for use in games
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameAPI;
}
