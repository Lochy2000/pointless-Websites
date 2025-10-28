# RetroArcade 2025

A modern retro-themed arcade platform featuring classic games and AI-powered game generation using the Gemini API.

## Project Structure

```
game/retro-emulator/
├── index.html              # Main application entry point
├── .env                    # API keys (contains GEMINI_API_KEY)
├── README.md              # This file
│
├── css/                    # Modular stylesheets
│   ├── main.css           # Core styles and variables
│   ├── arcade-effects.css # Neon effects, buttons, animations
│   └── responsive.css     # Mobile/tablet responsive styles
│
├── js/                     # Modular JavaScript files
│   ├── app.js             # Main application logic
│   ├── navigation.js      # Screen/route management
│   ├── storage.js         # localStorage manager (scores, saves, generated games)
│   ├── game-loader.js     # Game iframe loader and postMessage handler
│   └── ai-generator.js    # Gemini API integration for game generation
│
├── engine/                 # Shared game engine framework
│   ├── game-engine.js     # Core game loop, canvas utilities
│   ├── input-handler.js   # Keyboard, mouse, touch input management
│   ├── collision.js       # Collision detection helpers
│   ├── sprite-manager.js  # Sprite loading and animation
│   └── game-api.js        # Parent-child communication API
│
├── games/                  # Individual game implementations
│   └── space-invaders-x/  # Proof of concept shooter game
│       ├── game.html      # Game entry point
│       ├── game.js        # Game logic
│       └── config.json    # Game metadata
│
└── generated-games/        # AI-generated games stored here
    └── .gitignore         # Don't commit generated games
```

## Features

### Current Features ✅
- **Modular Architecture**: Clean separation of CSS, JS, and game files
- **Classic Games**: Browse games by genre (Platformer, Shooter, Puzzle, Beat 'em Up, Racing)
- **Space Invaders X**: Fully playable proof-of-concept game demonstrating the engine
- **Game Engine Framework**: Reusable components for building retro games
- **High Score Tracking**: Local storage of high scores per game
- **Responsive Design**: Works on desktop and mobile devices
- **Parent-Child Communication**: Games communicate with the main app via postMessage API

### In Progress 🚧
- **AI Game Generator**: Generate custom games using Gemini API
- **Touch Controls**: Virtual joystick and action buttons for mobile
- **More Classic Games**: Additional playable games across all genres

## How to Use

### Running the Application
1. Open `index.html` in a web browser
2. Click "Play Classics" to browse and play existing games
3. Click "Generate New Game" to create a custom game with AI

### Playing Space Invaders X
1. Select "Shooter" genre
2. Choose "Space Invaders X"
3. Controls:
   - **Arrow Keys** or **A/D**: Move left/right
   - **Space** or **Z**: Shoot
   - **ESC**: Pause/Menu

### Building a New Game

Games can use as much or as little of the engine framework as needed. Here's a minimal example:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Game</title>
</head>
<body>
  <canvas id="gameCanvas"></canvas>

  <!-- Include engine files -->
  <script src="../../engine/game-api.js"></script>
  <script src="../../engine/game-engine.js"></script>
  <script src="../../engine/input-handler.js"></script>

  <script>
    // Create game engine
    const game = new GameEngine('gameCanvas', {
      width: 800,
      height: 600
    });

    // Create input handler
    const input = new InputHandler();

    // Override update method
    game.update = function(dt) {
      // Your game logic here
    };

    // Override render method
    game.render = function() {
      game.clear();
      // Your rendering here
    };

    // Notify parent app
    gameAPI.ready();

    // Start the game
    game.start();
  </script>
</body>
</html>
```

### Game API

Games communicate with the parent app using the Game API:

```javascript
// Notify ready
gameAPI.ready();

// Update score
gameAPI.updateScore(newScore);

// Game over
gameAPI.gameOver(finalScore);

// Listen for pause/resume
gameAPI.onPause(() => game.pause());
gameAPI.onResume(() => game.resume());
```

## AI Game Generation

The AI game generator uses the Gemini API to create complete, playable games based on:
- **Genre**: Platformer, Shooter, Puzzle, Beat 'em Up, Racing
- **Difficulty**: Easy, Medium, Hard
- **Custom Prompts**: Optional additional requirements

Generated games are:
- Saved to `localStorage`
- Self-contained HTML files with embedded CSS/JS
- Built using the shared game engine framework
- Playable immediately after generation

## Development

### Adding a New Game
1. Create a folder in `games/` (e.g., `games/my-game/`)
2. Add `game.html`, `game.js`, and `config.json`
3. Update `js/app.js` to include the game in `classicGames` object
4. Set the `path` property to point to your game's HTML file

### Game Configuration
Each game should have a `config.json`:

```json
{
  "id": "unique-id",
  "title": "Game Title",
  "description": "Short description",
  "genre": "shooter",
  "thumbnail": "https://example.com/thumb.png",
  "controls": {
    "keyboard": {
      "move": "Arrow Keys",
      "action": "Space"
    },
    "touch": {
      "enabled": true
    }
  }
}
```

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5 Canvas, CSS3
- **Styling**: Tailwind CSS (CDN), Custom CSS with retro/neon aesthetics
- **AI**: Google Gemini API for game generation
- **Storage**: localStorage for persistence
- **Fonts**: Press Start 2P (Google Fonts)
- **Icons**: Font Awesome

## Future Enhancements

- [ ] More playable classic games (1 per genre minimum)
- [ ] Touch control implementation
- [ ] Save/load game state functionality
- [ ] Multiplayer support
- [ ] Leaderboards (online)
- [ ] Game editor/customization tools
- [ ] Sound effects and music
- [ ] Achievements system
- [ ] Share generated games feature

## License

This is a personal project. All rights reserved.

---

**Note**: Make sure to keep your `.env` file secure and never commit it to public repositories!
