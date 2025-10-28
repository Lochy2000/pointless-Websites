/**
 * Game Loader - Manages loading and communication with game iframes
 */
const GameLoader = {
  currentGameId: null,
  currentIframe: null,
  currentScore: 0,

  /**
   * Load a game into the iframe
   * @param {string} gameId - The game identifier
   * @param {string} gameTitle - The game title
   * @param {string} gamePath - Path to the game HTML file (optional for generated games)
   */
  loadGame(gameId, gameTitle, gamePath = null) {
    this.currentGameId = gameId;
    this.currentScore = 0;

    // Update UI
    document.getElementById('game-title').textContent = gameTitle;
    document.getElementById('game-score').textContent = 'Score: 0';

    const iframe = document.getElementById('game-iframe');
    this.currentIframe = iframe;

    if (gameId.startsWith('gen-')) {
      // Load generated game
      const generatedGame = StorageManager.getGeneratedGame(gameId);
      if (generatedGame) {
        iframe.srcdoc = generatedGame.code;
      } else {
        console.error('Generated game not found:', gameId);
        return;
      }
    } else if (gamePath) {
      // Load classic game from file
      iframe.src = gamePath;
    } else {
      // Placeholder for unimplemented games
      iframe.srcdoc = this.createPlaceholder(gameTitle);
    }

    // Show controls for mobile if game supports it
    this.setupControls(gameId);

    // Show the game screen
    NavigationManager.showScreen('game-screen');
  },

  /**
   * Create a placeholder screen for unimplemented games
   * @param {string} gameTitle - The game title
   * @returns {string} HTML string for placeholder
   */
  createPlaceholder(gameTitle) {
    return `
      <html>
        <head>
          <style>
            body {
              margin: 0;
              overflow: hidden;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
              color: white;
              font-family: 'Press Start 2P', cursive;
              text-align: center;
              padding: 20px;
            }
            h2 {
              font-size: 1.5rem;
              color: #8c52ff;
              text-shadow: 0 0 10px #8c52ff;
              margin-bottom: 20px;
            }
            p {
              font-size: 0.8rem;
              line-height: 1.8;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div>
            <h2>${gameTitle}</h2>
            <p>This game is coming soon!</p>
            <p style="font-size: 0.6rem; margin-top: 30px;">Press the menu button to go back</p>
          </div>
        </body>
      </html>
    `;
  },

  /**
   * Setup controls based on game configuration
   * @param {string} gameId - The game identifier
   */
  setupControls(gameId) {
    const joystickContainer = document.querySelector('.joystick-container');
    const actionButtons = document.querySelector('.action-buttons');

    // For now, hide on desktop, show on mobile for all games
    // Later this will be driven by game config
    if (window.innerWidth < 768) {
      joystickContainer.classList.remove('hidden');
      actionButtons.classList.remove('hidden');
    } else {
      joystickContainer.classList.add('hidden');
      actionButtons.classList.add('hidden');
    }
  },

  /**
   * Handle messages from game iframe
   * @param {MessageEvent} event - The message event
   */
  handleGameMessage(event) {
    const message = event.data;

    if (message.type === 'SCORE_UPDATE') {
      this.updateScore(message.score);
    } else if (message.type === 'GAME_OVER') {
      this.handleGameOver(message.score);
    } else if (message.type === 'GAME_READY') {
      console.log('Game loaded and ready');
    } else if (message.type === 'REQUEST_PAUSE') {
      this.pauseGame();
    }
  },

  /**
   * Update the displayed score
   * @param {number} score - The new score
   */
  updateScore(score) {
    this.currentScore = score;
    document.getElementById('game-score').textContent = `Score: ${score}`;
  },

  /**
   * Handle game over event
   * @param {number} finalScore - The final score
   */
  handleGameOver(finalScore) {
    // Save high score
    StorageManager.saveHighScore(this.currentGameId, finalScore);

    // Show game over modal or return to menu
    // For now, just log it
    console.log('Game Over! Final Score:', finalScore);
  },

  /**
   * Send pause command to game
   */
  pauseGame() {
    if (this.currentIframe) {
      this.currentIframe.contentWindow.postMessage({ type: 'PAUSE' }, '*');
    }
  },

  /**
   * Send resume command to game
   */
  resumeGame() {
    if (this.currentIframe) {
      this.currentIframe.contentWindow.postMessage({ type: 'RESUME' }, '*');
    }
  },

  /**
   * Send control input to game
   * @param {string} control - The control type (up, down, left, right, action1, action2)
   * @param {boolean} pressed - Whether the control is pressed or released
   */
  sendControl(control, pressed) {
    if (this.currentIframe) {
      this.currentIframe.contentWindow.postMessage({
        type: 'CONTROL_INPUT',
        control: control,
        pressed: pressed
      }, '*');
    }
  },

  /**
   * Initialize the game loader
   */
  init() {
    // Listen for messages from game iframes
    window.addEventListener('message', (event) => this.handleGameMessage(event));
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameLoader;
}
