/**
 * AI Game Generator - Handles game generation using Gemini API
 */
const AIGameGenerator = {
  apiKey: null,
  isGenerating: false,

  /**
   * Initialize the generator with API key from .env
   */
  async init() {
    try {
      // Fetch API key from .env file
      const response = await fetch('.env');
      const text = await response.text();
      const match = text.match(/GEMINI_API_KEY=(.+)/);
      if (match) {
        this.apiKey = match[1].trim();
      } else {
        console.error('GEMINI_API_KEY not found in .env file');
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  },

  /**
   * Generate a game using Gemini API
   * @param {string} genre - The game genre
   * @param {string} difficulty - The difficulty level
   * @param {string} customPrompt - Optional custom prompt from user
   * @returns {Promise<Object>} The generated game data
   */
  async generateGame(genre, difficulty, customPrompt = '') {
    if (!this.apiKey) {
      throw new Error('API key not initialized');
    }

    if (this.isGenerating) {
      throw new Error('Already generating a game');
    }

    this.isGenerating = true;

    try {
      const prompt = this.buildPrompt(genre, difficulty, customPrompt);
      const gameCode = await this.callGeminiAPI(prompt);

      const gameData = {
        title: this.extractTitle(gameCode, genre),
        genre: genre,
        difficulty: difficulty,
        code: gameCode
      };

      // Save the generated game
      const gameId = StorageManager.saveGeneratedGame(gameData);
      gameData.id = gameId;

      return gameData;
    } finally {
      this.isGenerating = false;
    }
  },

  /**
   * Build the prompt for game generation
   * @param {string} genre - The game genre
   * @param {string} difficulty - The difficulty level
   * @param {string} customPrompt - Optional custom prompt
   * @returns {string} The complete prompt
   */
  buildPrompt(genre, difficulty, customPrompt) {
    const basePrompt = `Create a complete, playable retro-style ${genre} game in a single HTML file with embedded CSS and JavaScript.

Requirements:
- Genre: ${genre}
- Difficulty: ${difficulty}
- Style: Retro/arcade aesthetic with pixel art feel
- Self-contained: All code in one HTML file (no external dependencies except fonts)
- Canvas-based rendering
- Keyboard controls (Arrow keys + Space/Z/X keys)
- Score tracking
- Use the Press Start 2P font from Google Fonts
- Dark retro color scheme (purples, blues, neon accents)

The game MUST implement postMessage communication:
1. Send score updates: window.parent.postMessage({type: 'SCORE_UPDATE', score: currentScore}, '*');
2. Send game over: window.parent.postMessage({type: 'GAME_OVER', score: finalScore}, '*');
3. Send ready signal: window.parent.postMessage({type: 'GAME_READY'}, '*');
4. Listen for pause/resume: window.addEventListener('message', (e) => { if(e.data.type === 'PAUSE') {...} });

${customPrompt ? `Additional requirements: ${customPrompt}` : ''}

Generate ONLY the complete HTML code, no explanations. Start with <!DOCTYPE html>.`;

    return basePrompt;
  },

  /**
   * Call the Gemini API
   * @param {string} prompt - The generation prompt
   * @returns {Promise<string>} The generated HTML code
   */
  async callGeminiAPI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid API response');
    }

    let generatedText = data.candidates[0].content.parts[0].text;

    // Extract HTML from code blocks if present
    generatedText = this.extractHTML(generatedText);

    return generatedText;
  },

  /**
   * Extract HTML from markdown code blocks
   * @param {string} text - The generated text
   * @returns {string} The extracted HTML
   */
  extractHTML(text) {
    // Remove markdown code blocks if present
    const codeBlockMatch = text.match(/```html\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // If no code block, check if it starts with <!DOCTYPE or <html
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      return text.trim();
    }

    // Otherwise return as-is and hope for the best
    return text;
  },

  /**
   * Extract game title from generated code
   * @param {string} code - The generated HTML code
   * @param {string} genre - The game genre
   * @returns {string} The extracted or generated title
   */
  extractTitle(code, genre) {
    // Try to extract from <title> tag
    const titleMatch = code.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1];
    }

    // Fallback to generated title
    const genreNames = {
      platformer: 'Platformer',
      shooter: 'Shooter',
      puzzle: 'Puzzle',
      beatem: 'Beat \'em Up',
      racing: 'Racing'
    };

    return `AI ${genreNames[genre] || genre} Game`;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIGameGenerator;
}
