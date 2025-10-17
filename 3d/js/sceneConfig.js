// Scene configuration with metadata for all 6 environments

export const sceneConfigs = [
    {
        id: 'office-kitchen',
        name: 'Office Kitchen Area',
        description: 'A modern workspace perfect for collaborative thinking and creative breaks. Ideal for social work sessions or casual team discussions.',
        modelPath: './3d-assets/office-kitchen-area.glb',
        tags: ['Collaborative', 'Social', 'Modern', 'Break Time'],
        mood: 'social',
        camera: {
            position: { x: 3, y: 2, z: 3 },
            target: { x: 0, y: 1, z: 0 }
        },
        lighting: {
            ambient: 0.6,
            directional: 0.8
        }
    },
    {
        id: 'japanese-garden',
        name: 'Japanese Garden',
        description: 'A tranquil zen garden designed for mindfulness and peaceful contemplation. Perfect for meditation, creative thinking, or finding clarity.',
        modelPath: './3d-assets/japaense-garden.glb',
        tags: ['Calm', 'Meditation', 'Nature', 'Zen'],
        mood: 'calm',
        camera: {
            position: { x: 2.5, y: 1.5, z: 2.5 },
            target: { x: 0, y: 0.5, z: 0 }
        },
        lighting: {
            ambient: 0.7,
            directional: 0.6
        }
    },
    {
        id: 'laboratory',
        name: 'Research Laboratory',
        description: 'A focused scientific environment for deep analytical work. Ideal for complex problem-solving, research, and detail-oriented tasks.',
        modelPath: './3d-assets/labrotory.glb',
        tags: ['Focus', 'Analytical', 'Scientific', 'Deep Work'],
        mood: 'focused',
        camera: {
            position: { x: 3.5, y: 2, z: 3.5 },
            target: { x: 0, y: 1, z: 0 }
        },
        lighting: {
            ambient: 0.5,
            directional: 0.9
        }
    },
    {
        id: 'factory-belt',
        name: 'Factory Production Line',
        description: 'An energetic industrial space that promotes productivity and momentum. Perfect for task execution, building momentum, and getting things done.',
        modelPath: './3d-assets/factory-belt.glb',
        tags: ['Productive', 'Energetic', 'Action', 'Momentum'],
        mood: 'energetic',
        camera: {
            position: { x: 4, y: 2.5, z: 4 },
            target: { x: 0, y: 1.5, z: 0 }
        },
        lighting: {
            ambient: 0.4,
            directional: 1.0
        }
    },
    {
        id: 'carpenter-shop',
        name: 'Carpenter Workshop',
        description: 'A hands-on creative space for craftsmanship and building. Ideal for creative projects, design work, and bringing ideas to life.',
        modelPath: './3d-assets/carpentor-shop.glb',
        tags: ['Creative', 'Craftsmanship', 'Hands-on', 'Building'],
        mood: 'creative',
        camera: {
            position: { x: 3, y: 2, z: 3 },
            target: { x: 0, y: 1, z: 0 }
        },
        lighting: {
            ambient: 0.5,
            directional: 0.8
        }
    },
    {
        id: 'old-town',
        name: 'Historic Old Town',
        description: 'A charming historic urban environment for exploratory thinking and learning. Ideal for research, curiosity-driven work, and discovering new ideas.',
        modelPath: './3d-assets/old-town.glb',
        tags: ['Exploratory', 'Historic', 'Urban', 'Learning'],
        mood: 'exploratory',
        camera: {
            position: { x: 4.5, y: 3, z: 4.5 },
            target: { x: 0, y: 2, z: 0 }
        },
        lighting: {
            ambient: 0.6,
            directional: 0.7
        }
    }
];

// Helper function to get scene by ID
export function getSceneById(id) {
    return sceneConfigs.find(scene => scene.id === id);
}

// Helper function to get scene by index
export function getSceneByIndex(index) {
    return sceneConfigs[index] || null;
}

// Get total number of scenes
export function getTotalScenes() {
    return sceneConfigs.length;
}
