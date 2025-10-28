/**
 * Navigation Manager - Handles screen transitions and routing
 */
const NavigationManager = {
  currentScreen: 'home-screen',

  /**
   * Show a specific screen and hide all others
   * @param {string} screenId - The screen element ID to show
   */
  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('main > div').forEach(screen => {
      screen.classList.add('hidden');
    });

    // Show requested screen
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
      this.currentScreen = screenId;
    }
  },

  /**
   * Navigate back to the previous screen based on current context
   */
  goBack() {
    const currentScreen = this.currentScreen;

    if (currentScreen === 'genre-screen') {
      this.showScreen('home-screen');
    } else if (currentScreen === 'game-list-screen') {
      this.showScreen('genre-screen');
    } else if (currentScreen === 'generate-game-screen') {
      this.showScreen('home-screen');
    } else if (currentScreen === 'game-screen') {
      this.showScreen('game-list-screen');
    } else {
      this.showScreen('home-screen');
    }
  },

  /**
   * Initialize navigation event listeners
   */
  init() {
    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => this.goBack());
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationManager;
}
