/**
 * Storage Manager - Handles all localStorage operations
 */
const StorageManager = {
  /**
   * Get high scores for a specific game
   * @param {string} gameId - The game identifier
   * @returns {Array} Array of score objects
   */
  getHighScores(gameId) {
    const scores = JSON.parse(localStorage.getItem('highScores')) || {};
    return scores[gameId] || [];
  },

  /**
   * Save a new high score
   * @param {string} gameId - The game identifier
   * @param {number} score - The score value
   */
  saveHighScore(gameId, score) {
    const allScores = JSON.parse(localStorage.getItem('highScores')) || {};
    const gameScores = allScores[gameId] || [];

    // Add new score
    gameScores.push({
      score: score,
      date: new Date().toISOString().split('T')[0]
    });

    // Sort and limit to top 10
    gameScores.sort((a, b) => b.score - a.score);
    allScores[gameId] = gameScores.slice(0, 10);

    localStorage.setItem('highScores', JSON.stringify(allScores));
  },

  /**
   * Save game state for later resuming
   * @param {string} gameId - The game identifier
   * @param {Object} state - The game state object
   */
  saveGameState(gameId, state) {
    const gameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
    gameStates[gameId] = {
      state: state,
      timestamp: Date.now()
    };
    localStorage.setItem('gameStates', JSON.stringify(gameStates));
  },

  /**
   * Load saved game state
   * @param {string} gameId - The game identifier
   * @returns {Object|null} The saved game state or null
   */
  loadGameState(gameId) {
    const gameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
    return gameStates[gameId]?.state || null;
  },

  /**
   * Save a generated game
   * @param {Object} gameData - The generated game data
   * @returns {string} The generated game ID
   */
  saveGeneratedGame(gameData) {
    const generatedGames = JSON.parse(localStorage.getItem('generatedGames')) || [];
    const gameId = `gen-${Date.now()}`;

    generatedGames.push({
      id: gameId,
      title: gameData.title,
      genre: gameData.genre,
      difficulty: gameData.difficulty,
      code: gameData.code,
      timestamp: Date.now()
    });

    localStorage.setItem('generatedGames', JSON.stringify(generatedGames));
    return gameId;
  },

  /**
   * Get all generated games
   * @returns {Array} Array of generated game objects
   */
  getGeneratedGames() {
    return JSON.parse(localStorage.getItem('generatedGames')) || [];
  },

  /**
   * Get a specific generated game
   * @param {string} gameId - The game identifier
   * @returns {Object|null} The generated game or null
   */
  getGeneratedGame(gameId) {
    const games = this.getGeneratedGames();
    return games.find(g => g.id === gameId) || null;
  },

  /**
   * Delete a generated game
   * @param {string} gameId - The game identifier
   */
  deleteGeneratedGame(gameId) {
    const games = this.getGeneratedGames();
    const filtered = games.filter(g => g.id !== gameId);
    localStorage.setItem('generatedGames', JSON.stringify(filtered));
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
