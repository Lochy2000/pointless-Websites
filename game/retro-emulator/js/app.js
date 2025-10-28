/**
 * RetroArcade 2025 - Main Application
 */

// Game data
const classicGames = {
  platformer: [
    { id: 'p1', title: 'Super Jump Quest', description: 'Classic platforming adventure with 8 worlds to conquer', thumbnail: 'https://cdn.pixabay.com/photo/2017/09/08/20/29/chess-2730034_960_720.jpg', path: null },
    { id: 'p2', title: 'Pixel Runner', description: 'Run, jump and collect coins across dangerous terrain', thumbnail: 'https://cdn.pixabay.com/photo/2013/07/12/15/24/pacman-149704_960_720.png', path: null },
    { id: 'p3', title: 'Cave Explorer', description: 'Navigate mysterious caves filled with treasures and traps', thumbnail: 'https://cdn.pixabay.com/photo/2016/04/01/09/11/boy-1299608_960_720.png', path: null }
  ],
  shooter: [
    { id: 's1', title: 'Space Invaders X', description: 'Defend Earth from waves of alien attackers', thumbnail: 'https://cdn.pixabay.com/photo/2017/02/10/14/08/space-invaders-2055100_960_720.png', path: 'games/space-invaders-x/game.html' },
    { id: 's2', title: 'Galactic Defender', description: 'Fast-paced space shooter with power-ups', thumbnail: 'https://cdn.pixabay.com/photo/2016/09/10/15/50/space-shooter-1659666_960_720.jpg', path: null },
    { id: 's3', title: 'Robot Wars', description: 'Battle robots in a post-apocalyptic world', thumbnail: 'https://cdn.pixabay.com/photo/2013/07/12/15/36/robot-150559_960_720.png', path: null }
  ],
  puzzle: [
    { id: 'pz1', title: 'Block Breaker', description: 'Classic block-matching puzzle game with 100 levels', thumbnail: 'https://cdn.pixabay.com/photo/2014/04/02/10/55/tetris-304772_960_720.png', path: null },
    { id: 'pz2', title: 'Memory Masters', description: 'Test your memory with increasing challenges', thumbnail: 'https://cdn.pixabay.com/photo/2016/03/31/19/19/card-1294962_960_720.png', path: null },
    { id: 'pz3', title: 'Logic Labyrinth', description: 'Mind-bending puzzles that test your logical thinking', thumbnail: 'https://cdn.pixabay.com/photo/2014/04/03/00/39/labyrinth-309038_960_720.png', path: null }
  ],
  beatem: [
    { id: 'b1', title: 'Street Brawler', description: 'Classic side-scrolling fighting game with 8 unique fighters', thumbnail: 'https://cdn.pixabay.com/photo/2017/08/01/11/48/blue-2564660_960_720.jpg', path: null },
    { id: 'b2', title: 'Kung Fu Masters', description: 'Master various martial arts styles to defeat your enemies', thumbnail: 'https://cdn.pixabay.com/photo/2014/04/03/10/45/karate-311106_960_720.png', path: null },
    { id: 'b3', title: 'Ninja Revenge', description: 'Fast-paced ninja combat with stealth elements', thumbnail: 'https://cdn.pixabay.com/photo/2013/07/13/09/25/ninja-155852_960_720.png', path: null }
  ],
  racing: [
    { id: 'r1', title: 'Retro Racers', description: 'Race through 20 tracks with various 8-bit vehicles', thumbnail: 'https://cdn.pixabay.com/photo/2013/07/13/11/26/car-158089_960_720.png', path: null },
    { id: 'r2', title: 'Turbo Challenge', description: 'High-speed arcade racing with nitro boosts', thumbnail: 'https://cdn.pixabay.com/photo/2014/04/03/10/29/car-310542_960_720.png', path: null },
    { id: 'r3', title: 'Pixel Grand Prix', description: 'Championship racing with vehicle upgrades', thumbnail: 'https://cdn.pixabay.com/photo/2017/01/31/17/10/car-2025663_960_720.png', path: null }
  ]
};

// Application state
const AppState = {
  currentMode: null, // 'classics' or 'generate'
  currentGenre: null
};

/**
 * Initialize the application
 */
function initApp() {
  // Initialize managers
  NavigationManager.init();
  GameLoader.init();
  AIGameGenerator.init();

  // Setup event listeners
  setupHomeScreenListeners();
  setupGenreScreenListeners();
  setupGenerateScreenListeners();
  setupGameScreenListeners();
  setupModalListeners();

  // Show home screen
  NavigationManager.showScreen('home-screen');
}

/**
 * Setup home screen event listeners
 */
function setupHomeScreenListeners() {
  // Play Classics Button
  document.getElementById('play-classics-btn').addEventListener('click', () => {
    AppState.currentMode = 'classics';
    document.getElementById('genre-title').textContent = 'Select Classic Genre';
    NavigationManager.showScreen('genre-screen');
  });

  // Generate Game Button
  document.getElementById('generate-game-btn').addEventListener('click', () => {
    AppState.currentMode = 'generate';
    NavigationManager.showScreen('generate-game-screen');
  });
}

/**
 * Setup genre selection screen listeners
 */
function setupGenreScreenListeners() {
  document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const genre = this.dataset.genre;
      AppState.currentGenre = genre;

      if (AppState.currentMode === 'classics') {
        showGameList(genre);
      }
    });
  });
}

/**
 * Show the game list for a specific genre
 * @param {string} genre - The game genre
 */
function showGameList(genre) {
  const genreName = genre.charAt(0).toUpperCase() + genre.slice(1);
  document.getElementById('game-list-title').textContent = `Select ${genreName} Game`;

  // Populate game list
  const gamesContainer = document.getElementById('games-container');
  gamesContainer.innerHTML = '';

  const games = classicGames[genre] || [];
  games.forEach(game => {
    const gameItem = document.createElement('div');
    gameItem.className = 'game-item bg-gray-800 rounded-lg overflow-hidden flex items-center hover:bg-gray-700 transition cursor-pointer';

    gameItem.innerHTML = `
      <div class="w-24 h-24 overflow-hidden flex-shrink-0">
        <img src="${game.thumbnail}" alt="${game.title}" class="w-full h-full object-cover pixel-effect">
      </div>
      <div class="p-4">
        <h3 class="text-md font-bold">${game.title}</h3>
        <p class="text-xs text-gray-400 mt-1">${game.description}</p>
      </div>
    `;

    gameItem.addEventListener('click', () => {
      GameLoader.loadGame(game.id, game.title, game.path);
    });

    gamesContainer.appendChild(gameItem);
  });

  NavigationManager.showScreen('game-list-screen');
}

/**
 * Setup generate game screen listeners
 */
function setupGenerateScreenListeners() {
  // Difficulty buttons
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.difficulty-btn').forEach(b =>
        b.classList.remove('selected', 'ring', 'ring-white')
      );
      this.classList.add('selected', 'ring', 'ring-white');
    });
  });

  // Default select medium difficulty
  document.querySelector('[data-difficulty="medium"]')?.classList.add('selected', 'ring', 'ring-white');

  // Create Game Button
  document.getElementById('create-game-btn').addEventListener('click', async () => {
    const genre = document.getElementById('generate-genre').value;
    const difficulty = document.querySelector('.difficulty-btn.selected')?.dataset.difficulty || 'medium';

    // Show loading screen
    document.getElementById('loading-message').textContent = `Generating your custom ${genre} game...`;
    NavigationManager.showScreen('loading-screen');

    try {
      const gameData = await AIGameGenerator.generateGame(genre, difficulty);
      GameLoader.loadGame(gameData.id, gameData.title);
    } catch (error) {
      console.error('Failed to generate game:', error);
      alert('Failed to generate game. Please try again.');
      NavigationManager.showScreen('generate-game-screen');
    }
  });
}

/**
 * Setup game screen listeners
 */
function setupGameScreenListeners() {
  // Pause button
  document.getElementById('pause-btn').addEventListener('click', () => {
    GameLoader.pauseGame();
    document.getElementById('pause-modal').classList.remove('hidden');
  });

  // Menu button (same as pause for now)
  document.getElementById('menu-btn').addEventListener('click', () => {
    GameLoader.pauseGame();
    document.getElementById('pause-modal').classList.remove('hidden');
  });
}

/**
 * Setup modal listeners
 */
function setupModalListeners() {
  // Resume button
  document.getElementById('resume-btn').addEventListener('click', () => {
    GameLoader.resumeGame();
    document.getElementById('pause-modal').classList.add('hidden');
  });

  // Save & Exit button
  document.getElementById('save-exit-btn').addEventListener('click', () => {
    // Save game state (would need to request state from game)
    document.getElementById('pause-modal').classList.add('hidden');
    NavigationManager.showScreen('home-screen');
  });

  // High Scores button
  document.getElementById('high-scores-btn').addEventListener('click', () => {
    showHighScores();
  });

  // Close high scores modal
  document.getElementById('close-high-scores').addEventListener('click', () => {
    document.getElementById('high-scores-modal').classList.add('hidden');
  });

  // Back to pause from high scores
  document.getElementById('back-to-pause').addEventListener('click', () => {
    document.getElementById('high-scores-modal').classList.add('hidden');
    document.getElementById('pause-modal').classList.remove('hidden');
  });
}

/**
 * Show high scores modal
 */
function showHighScores() {
  const gameId = GameLoader.currentGameId;
  const scores = StorageManager.getHighScores(gameId);

  const highScoresList = document.getElementById('high-scores-list');
  highScoresList.innerHTML = '';

  if (scores.length === 0) {
    highScoresList.innerHTML = '<tr><td colspan="3" class="text-center">No high scores yet!</td></tr>';
  } else {
    scores.forEach((score, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${score.score}</td>
        <td>${score.date}</td>
      `;
      highScoresList.appendChild(row);
    });
  }

  document.getElementById('pause-modal').classList.add('hidden');
  document.getElementById('high-scores-modal').classList.remove('hidden');
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
