# Mindspace Navigator

A modern, immersive 3D environment selector designed to enhance your workflow and mindset. Choose from 7  rendered environments that match your current mood and work needs.

## Features

- **7 Unique Environments**: From tranquil Japanese gardens to productive factory floors
- **Smooth Animations**: GSAP-powered transitions for a fluid experience
- **Interactive 3D Exploration**: Rotate, zoom, and explore each scene with mouse controls
- **Favorites System**: Save your preferred environments with LocalStorage persistence
- **Keyboard Navigation**: Quick access with ESC, arrow keys, and more
- **Modern UI**: Glassmorphism design with responsive layout
- **Performance Optimized**: Efficient Three.js rendering with shadow mapping

## Environments

1. **Office Kitchen Area** - Collaborative social workspace
2. **Japanese Garden** - Calm meditation and zen focus
3. **Research Laboratory** - Deep analytical work
4. **Factory Production Line** - Energetic productivity
5. **Carpenter Workshop** - Creative craftsmanship
6. **Ancient Tree** - Natural grounding and reflection
7. **Historic Old Town** - Exploratory learning

## Usage

### Getting Started

Simply open `index.html` in a modern web browser. The app will automatically load all 3D environments.

### Navigation

**Gallery View:**
- Click any scene card to enter immersive mode
- Click the heart icon to add/remove favorites
- Hover over cards to preview 3D rotation

**Immersive View:**
- **Mouse**: Click and drag to rotate the scene
- **Scroll**: Zoom in/out
- **ESC**: Return to gallery
- **← →**: Navigate between scenes
- **Heart Icon**: Toggle favorite

### Controls

- **Back Button**: Return to gallery view
- **Navigation Arrows**: Switch between environments
- **Info Button**: View app information
- **Favorites Button**: View your saved favorites

## Technical Stack

- **Three.js** - 3D rendering and GLB model loading
- **GSAP** - Smooth animations and transitions
- **Vanilla JavaScript** - No frameworks, modular ES6 structure
- **Modern CSS** - Glassmorphism, CSS Grid, custom properties
- **LocalStorage API** - Persistent favorites and preferences

## Project Structure

```
3d/
├── index.html              # Main HTML structure
├── index.css               # Styles with glassmorphism
├── index.js                # Main application logic
├── js/
│   ├── sceneConfig.js      # Scene metadata and configuration
│   ├── sceneManager.js     # Three.js scene management
│   ├── transitions.js      # GSAP animation helpers
│   └── storage.js          # LocalStorage utilities
└── 3d-assets/
    ├── office-kitchen-area.glb
    ├── japaense-garden.glb
    ├── labrotory.glb
    ├── factory-belt.glb
    ├── carpentor-shop.glb
    ├── tree.glb
    └── old-town.glb
```

## Browser Support

Requires a modern browser with ES6 module support:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## Performance Notes

- All models are loaded on initialization for smooth scene switching
- Preview renderers use independent animation loops for gallery cards
- Shadow mapping is enabled for realistic lighting
- Optimized for 60fps rendering

## Customization

### Adding New Scenes

1. Add your GLB file to `3d-assets/`
2. Add configuration to `js/sceneConfig.js`:

```javascript
{
    id: 'my-scene',
    name: 'My Scene Name',
    description: 'Scene description',
    modelPath: './3d-assets/my-scene.glb',
    tags: ['Tag1', 'Tag2'],
    mood: 'calm',
    camera: {
        position: { x: 5, y: 3, z: 5 },
        target: { x: 0, y: 1, z: 0 }
    },
    lighting: {
        ambient: 0.6,
        directional: 0.8
    }
}
```

### Adjusting Camera & Lighting

Edit the `camera` and `lighting` properties in `sceneConfig.js` for each scene.

### Modifying Colors

Update CSS variables in `index.css`:

```css
:root {
    --accent-primary: #6366f1;
    --accent-secondary: #8b5cf6;
    /* ... more variables */
}
```

## Future Enhancements

- [ ] Ambient sound per environment (Tone.js)
- [ ] Timer/Pomodoro functionality
- [ ] Custom particle effects per scene
- [ ] Post-processing effects (bloom, depth of field)
- [ ] Scene-specific color themes
- [ ] Export/import favorites
- [ ] Mobile touch gesture support

## License

Created with Claude Code - Feel free to use and modify!
