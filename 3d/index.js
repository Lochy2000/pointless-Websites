// Main Application Logic
import { sceneConfigs, getSceneById, getTotalScenes } from './js/sceneConfig.js';
import { SceneManager } from './js/sceneManager.js';
import { Transitions } from './js/transitions.js';
import { Storage } from './js/storage.js';

class MindspaceNavigator {
    constructor() {
        this.sceneManager = new SceneManager();
        this.transitions = new Transitions();
        this.storage = new Storage();

        this.currentSceneIndex = 0;
        this.isImmersiveMode = false;

        // DOM elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgress = document.getElementById('loading-progress');
        this.loadingText = document.getElementById('loading-text');
        this.app = document.getElementById('app');
        this.galleryView = document.getElementById('gallery-view');
        this.immersiveView = document.getElementById('immersive-view');
        this.sceneGrid = document.getElementById('scene-grid');
        this.immersiveCanvas = document.getElementById('immersive-canvas');

        // Initialize
        this.init();
    }

    async init() {
        try {
            // Initialize Lucide icons
            lucide.createIcons();

            // Load all scenes
            await this.loadScenes();

            // Build gallery UI
            this.buildGallery();

            // Initialize event listeners
            this.initEventListeners();

            // Hide loading screen and show app
            await this.transitions.hideLoadingScreen(this.loadingScreen, this.app);

            // Initialize icons again for dynamically created elements
            lucide.createIcons();

        } catch (error) {
            console.error('Initialization error:', error);
            this.loadingText.textContent = 'Error loading environments. Please refresh.';
        }
    }

    async loadScenes() {
        await this.sceneManager.loadAllScenes(
            sceneConfigs,
            (loaded, total, sceneName) => {
                const percent = (loaded / total) * 100;
                this.transitions.animateLoadingProgress(this.loadingProgress, percent);
                this.loadingText.textContent = `Loading ${sceneName}... (${loaded}/${total})`;
            }
        );
    }

    buildGallery() {
        this.sceneGrid.innerHTML = '';

        sceneConfigs.forEach((config, index) => {
            const card = this.createSceneCard(config, index);
            this.sceneGrid.appendChild(card);
        });

        // Create preview renderers for each card
        setTimeout(() => {
            sceneConfigs.forEach((config) => {
                const previewContainer = document.querySelector(`[data-scene-id="${config.id}"] .scene-preview`);
                if (previewContainer) {
                    this.sceneManager.createPreviewRenderer(previewContainer, config.id);
                }
            });
        }, 100);
    }

    createSceneCard(config, index) {
        const card = document.createElement('div');
        card.className = 'scene-card';
        card.setAttribute('data-scene-id', config.id);
        card.setAttribute('data-scene-index', index);

        const isFavorite = this.storage.isFavorite(config.id);

        card.innerHTML = `
            <div class="scene-preview"></div>
            <div class="scene-card-content">
                <div class="scene-card-header">
                    <h3>${config.name}</h3>
                    <button class="favorite-icon ${isFavorite ? 'active' : ''}" data-scene-id="${config.id}">
                        <i data-lucide="heart"></i>
                    </button>
                </div>
                <p>${config.description}</p>
                <div class="scene-tags">
                    ${config.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        // Card click to enter immersive mode
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-icon')) {
                this.enterImmersiveMode(index);
            }
        });

        // Favorite button click
        const favoriteBtn = card.querySelector('.favorite-icon');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(config.id, favoriteBtn);
        });

        return card;
    }

    toggleFavorite(sceneId, button) {
        const result = this.storage.toggleFavorite(sceneId);

        if (result.success) {
            button.classList.toggle('active');
            this.transitions.pulseFavorite(button);

            // Update immersive view favorite button if in immersive mode
            if (this.isImmersiveMode) {
                const immersiveFavoriteBtn = document.getElementById('favorite-toggle');
                const currentConfig = this.sceneManager.getCurrentSceneConfig();
                if (currentConfig && currentConfig.id === sceneId) {
                    immersiveFavoriteBtn.classList.toggle('active');
                }
            }

            // Reinitialize icons
            lucide.createIcons();
        }
    }

    async enterImmersiveMode(sceneIndex) {
        this.currentSceneIndex = sceneIndex;
        const config = sceneConfigs[sceneIndex];

        // Initialize renderer if not already done
        if (!this.sceneManager.renderer) {
            this.sceneManager.initRenderer(this.immersiveCanvas);
        }

        // Display the scene
        this.sceneManager.displayScene(config.id, this.immersiveCanvas);

        // Update scene info
        this.updateSceneInfo(config);

        // Transition to immersive view
        await this.transitions.transitionToImmersive(this.galleryView, this.immersiveView);

        this.isImmersiveMode = true;

        // Track visit
        this.storage.setLastVisited(config.id);
    }

    async exitImmersiveMode() {
        // Stop render loop
        this.sceneManager.stopRenderLoop();

        // Transition back to gallery
        await this.transitions.transitionToGallery(this.immersiveView, this.galleryView);

        this.isImmersiveMode = false;
    }

    updateSceneInfo(config) {
        const title = document.getElementById('current-scene-title');
        const description = document.getElementById('current-scene-description');
        const tags = document.getElementById('current-scene-tags');
        const favoriteBtn = document.getElementById('favorite-toggle');

        title.textContent = config.name;
        description.textContent = config.description;
        tags.innerHTML = config.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // Update favorite button
        const isFavorite = this.storage.isFavorite(config.id);
        if (isFavorite) {
            favoriteBtn.classList.add('active');
        } else {
            favoriteBtn.classList.remove('active');
        }

        // Reinitialize icons
        lucide.createIcons();
    }

    navigateToScene(direction) {
        const totalScenes = getTotalScenes();

        if (direction === 'next') {
            this.currentSceneIndex = (this.currentSceneIndex + 1) % totalScenes;
        } else if (direction === 'prev') {
            this.currentSceneIndex = (this.currentSceneIndex - 1 + totalScenes) % totalScenes;
        }

        const config = sceneConfigs[this.currentSceneIndex];
        this.sceneManager.displayScene(config.id, this.immersiveCanvas);
        this.updateSceneInfo(config);
        this.storage.setLastVisited(config.id);
    }

    initEventListeners() {
        // Back button
        const backBtn = document.getElementById('back-btn');
        backBtn.addEventListener('click', () => {
            this.transitions.buttonClick(backBtn);
            this.exitImmersiveMode();
        });

        // Navigation arrows
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        prevBtn.addEventListener('click', () => {
            this.transitions.buttonClick(prevBtn);
            this.navigateToScene('prev');
        });

        nextBtn.addEventListener('click', () => {
            this.transitions.buttonClick(nextBtn);
            this.navigateToScene('next');
        });

        // Favorite toggle in immersive view
        const favoriteToggle = document.getElementById('favorite-toggle');
        favoriteToggle.addEventListener('click', () => {
            const currentConfig = this.sceneManager.getCurrentSceneConfig();
            if (currentConfig) {
                this.toggleFavorite(currentConfig.id, favoriteToggle);

                // Also update the gallery card
                const galleryCard = document.querySelector(`[data-scene-id="${currentConfig.id}"] .favorite-icon`);
                if (galleryCard) {
                    galleryCard.classList.toggle('active');
                    lucide.createIcons();
                }
            }
        });

        // Info modal
        const infoBtn = document.getElementById('info-btn');
        const infoModal = document.getElementById('info-modal');
        const closeInfoModal = document.getElementById('close-info-modal');

        infoBtn.addEventListener('click', () => {
            this.transitions.showModal(infoModal);
        });

        closeInfoModal.addEventListener('click', () => {
            this.transitions.hideModal(infoModal);
        });

        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                this.transitions.hideModal(infoModal);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isImmersiveMode) {
                switch(e.key) {
                    case 'Escape':
                        this.exitImmersiveMode();
                        break;
                    case 'ArrowLeft':
                        this.navigateToScene('prev');
                        break;
                    case 'ArrowRight':
                        this.navigateToScene('next');
                        break;
                }
            }
        });

        // Favorites button (header)
        const favoritesBtn = document.getElementById('favorites-btn');
        favoritesBtn.addEventListener('click', () => {
            const favorites = this.storage.getFavorites();
            if (favorites.length === 0) {
                alert('No favorites yet! Click the heart icon on any scene to add it to your favorites.');
            } else {
                const favoriteNames = favorites
                    .map(id => getSceneById(id)?.name)
                    .filter(Boolean)
                    .join('\n" ');
                alert(`Your Favorites:\n\n" ${favoriteNames}`);
            }
        });
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mindspaceNavigator = new MindspaceNavigator();
    });
} else {
    window.mindspaceNavigator = new MindspaceNavigator();
}
