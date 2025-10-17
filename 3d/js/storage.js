// Storage - LocalStorage utilities for favorites and preferences

const STORAGE_KEY = 'mindspace-navigator';

export class Storage {
    constructor() {
        this.data = this.load();
    }

    // Load data from localStorage
    load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }

        // Default data structure
        return {
            favorites: [],
            lastVisited: null,
            preferences: {
                autoRotate: false,
                showHints: true
            },
            visitCount: {}
        };
    }

    // Save data to localStorage
    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    // Add scene to favorites
    addFavorite(sceneId) {
        if (!this.data.favorites.includes(sceneId)) {
            this.data.favorites.push(sceneId);
            this.save();
            return true;
        }
        return false;
    }

    // Remove scene from favorites
    removeFavorite(sceneId) {
        const index = this.data.favorites.indexOf(sceneId);
        if (index > -1) {
            this.data.favorites.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    // Toggle favorite status
    toggleFavorite(sceneId) {
        if (this.isFavorite(sceneId)) {
            return { action: 'removed', success: this.removeFavorite(sceneId) };
        } else {
            return { action: 'added', success: this.addFavorite(sceneId) };
        }
    }

    // Check if scene is favorite
    isFavorite(sceneId) {
        return this.data.favorites.includes(sceneId);
    }

    // Get all favorites
    getFavorites() {
        return [...this.data.favorites];
    }

    // Get number of favorites
    getFavoriteCount() {
        return this.data.favorites.length;
    }

    // Set last visited scene
    setLastVisited(sceneId) {
        this.data.lastVisited = sceneId;
        this.incrementVisitCount(sceneId);
        this.save();
    }

    // Get last visited scene
    getLastVisited() {
        return this.data.lastVisited;
    }

    // Increment visit count for a scene
    incrementVisitCount(sceneId) {
        if (!this.data.visitCount[sceneId]) {
            this.data.visitCount[sceneId] = 0;
        }
        this.data.visitCount[sceneId]++;
    }

    // Get visit count for a scene
    getVisitCount(sceneId) {
        return this.data.visitCount[sceneId] || 0;
    }

    // Get most visited scenes (sorted)
    getMostVisited(limit = 5) {
        return Object.entries(this.data.visitCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([sceneId]) => sceneId);
    }

    // Set preference
    setPreference(key, value) {
        this.data.preferences[key] = value;
        this.save();
    }

    // Get preference
    getPreference(key) {
        return this.data.preferences[key];
    }

    // Clear all favorites
    clearFavorites() {
        this.data.favorites = [];
        this.save();
    }

    // Clear all data (reset)
    clearAll() {
        this.data = {
            favorites: [],
            lastVisited: null,
            preferences: {
                autoRotate: false,
                showHints: true
            },
            visitCount: {}
        };
        this.save();
    }

    // Export data as JSON
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // Import data from JSON
    importData(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.data = { ...this.data, ...imported };
            this.save();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Get statistics
    getStats() {
        return {
            totalFavorites: this.getFavoriteCount(),
            totalVisits: Object.values(this.data.visitCount).reduce((sum, count) => sum + count, 0),
            lastVisited: this.data.lastVisited,
            mostVisited: this.getMostVisited(3)
        };
    }
}
